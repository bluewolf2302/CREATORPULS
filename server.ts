import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get YouTube client
  const getYouTubeClient = (accessToken?: string) => {
    if (accessToken) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      return google.youtube({ version: "v3", auth });
    } else {
      return google.youtube({ version: "v3", auth: process.env.YOUTUBE_API_KEY || "AIzaSyCw-GbL-83ZXrBtMkN4oJhPJCctMEjnNJ4" });
    }
  };

  const getAnalyticsClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.youtubeAnalytics({ version: "v2", auth });
  };

  // API Routes
  app.get("/api/youtube/channel", async (req, res) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const handle = req.query.handle as string;
    const channelId = req.query.id as string;

    if (!accessToken && !handle && !channelId) {
      return res.status(401).json({ error: "Unauthorized or missing channel identifier" });
    }

    try {
      const youtube = (handle || channelId) ? getYouTubeClient() : getYouTubeClient(accessToken);
      
      const params: any = {
        part: ["statistics", "snippet", "brandingSettings", "contentDetails"],
      };

      if (handle) {
        params.forHandle = handle;
      } else if (channelId) {
        params.id = [channelId];
      } else {
        params.mine = true;
      }

      const response = await youtube.channels.list(params);

      const channel = response.data.items?.[0];
      if (!channel) throw new Error("No channel found");

      res.json({
        id: channel.id!,
        name: channel.snippet?.title!,
        handle: channel.snippet?.customUrl || "",
        description: channel.snippet?.description || "",
        thumbnailUrl: channel.snippet?.thumbnails?.high?.url || "",
        bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || "",
        subscriberCount: parseInt(channel.statistics?.subscriberCount || "0"),
        totalViews: parseInt(channel.statistics?.viewCount || "0"),
        videoCount: parseInt(channel.statistics?.videoCount || "0"),
        joinedDate: new Date(channel.snippet?.publishedAt!),
        country: channel.snippet?.country || "",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/youtube/videos", async (req, res) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const channelId = req.query.channelId as string;
    
    // If no access token and no channelId, we can't do anything
    if (!accessToken && !channelId) {
      return res.status(401).json({ error: "Unauthorized or missing channelId" });
    }

    const maxResults = parseInt((req.query.maxResults as string) || "50");

    try {
      // Use API key for public scraping if channelId is provided, otherwise use access token for 'mine'
      const youtube = channelId ? getYouTubeClient() : getYouTubeClient(accessToken);

      // Step 1: Get video IDs from search
      const searchRes = await youtube.search.list({
        part: ["snippet"],
        channelId: channelId || undefined,
        forMine: !channelId ? true : undefined,
        type: ["video"],
        order: "date",
        maxResults,
      });

      const videoIds = searchRes.data.items
        ?.map((item) => item.id?.videoId)
        .filter(Boolean) as string[];

      if (!videoIds?.length) return res.json([]);

      // Step 2: Get full stats for those videos
      const statsRes = await youtube.videos.list({
        part: ["statistics", "contentDetails", "snippet"],
        id: videoIds,
      });

      const parseDuration = (iso: string): number => {
        const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;
        const h = parseInt(match[1] || "0");
        const m = parseInt(match[2] || "0");
        const s = parseInt(match[3] || "0");
        return h * 3600 + m * 60 + s;
      };

      const videos = (statsRes.data.items || []).map((video) => {
        const views = parseInt(video.statistics?.viewCount || "0");
        const likes = parseInt(video.statistics?.likeCount || "0");
        const comments = parseInt(video.statistics?.commentCount || "0");

        const durationStr = video.contentDetails?.duration || "PT0S";
        const durationSeconds = parseDuration(durationStr);

        return {
          id: video.id!,
          title: video.snippet?.title!,
          description: video.snippet?.description || "",
          publishedAt: new Date(video.snippet?.publishedAt!),
          thumbnailUrl: video.snippet?.thumbnails?.medium?.url || "",
          views,
          likes,
          comments,
          durationSeconds,
          engagementRate:
            views > 0
              ? parseFloat((((likes + comments) / views) * 100).toFixed(2))
              : 0,
          tags: video.snippet?.tags || [],
        };
      });

      res.json(videos);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/youtube/analytics", async (req, res) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    const days = parseInt((req.query.days as string) || "28");

    try {
      const analytics = getAnalyticsClient(accessToken);
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await analytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: [
          "views",
          "likes",
          "comments",
          "estimatedMinutesWatched",
          "averageViewDuration",
          "subscribersGained",
          "subscribersLost",
          "annotationImpressions",
          "annotationClickThroughRate",
        ].join(","),
        dimensions: "day",
        sort: "day",
      });

      const headers = response.data.columnHeaders?.map((h) => h.name) || [];
      const rows = response.data.rows || [];

      const data = rows.map((row) => {
        const obj: Record<string, number | string> = {};
        headers.forEach((h, i) => {
          obj[h!] = row[i];
        });
        return {
          date: new Date(obj["day"] as string),
          views: Number(obj["views"]) || 0,
          likes: Number(obj["likes"]) || 0,
          comments: Number(obj["comments"]) || 0,
          watchTimeMinutes: Number(obj["estimatedMinutesWatched"]) || 0,
          avgViewDurationSec: Number(obj["averageViewDuration"]) || 0,
          subscriberGain:
            (Number(obj["subscribersGained"]) || 0) -
            (Number(obj["subscribersLost"]) || 0),
          impressions: Number(obj["annotationImpressions"]) || 0,
          ctr: parseFloat(
            (Number(obj["annotationClickThroughRate"]) * 100).toFixed(2)
          ),
        };
      });

      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/youtube/audience", async (req, res) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ error: "Unauthorized" });

    try {
      const analytics = getAnalyticsClient(accessToken);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Age + gender
      const ageRes = await analytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: "viewerPercentage",
        dimensions: "ageGroup,gender",
      });

      // Geography
      const geoRes = await analytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: "views",
        dimensions: "country",
        sort: "-views",
        maxResults: 5,
      });

      // Traffic sources
      const trafficRes = await analytics.reports.query({
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: "views",
        dimensions: "deviceType",
      });

      // Process age groups
      const ageMap: Record<string, number> = {};
      for (const row of ageRes.data.rows || []) {
        const group = String(row[0]);
        const pct = parseFloat(String(row[2]));
        ageMap[group] = (ageMap[group] || 0) + pct;
      }

      // Process geo
      const totalGeoViews = (geoRes.data.rows || []).reduce(
        (s, r) => s + Number(r[1]),
        0
      );
      const topCountries = (geoRes.data.rows || []).map((row) => ({
        name: String(row[0]),
        viewPercentage: parseFloat(
          ((Number(row[1]) / totalGeoViews) * 100).toFixed(1)
        ),
      }));

      // Process devices
      const totalDeviceViews = (trafficRes.data.rows || []).reduce(
        (s, r) => s + Number(r[1]),
        0
      );
      const deviceTypes = (trafficRes.data.rows || []).map((row) => ({
        name: String(row[0]),
        percentage: parseFloat(
          ((Number(row[1]) / totalDeviceViews) * 100).toFixed(1)
        ),
      }));

      // Fake peak hours for now as it requires specific permissions
      const peakHours = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => Math.floor(Math.random() * 100))
      );

      res.json({
        ageGroups: Object.entries(ageMap).map(([label, percentage]) => ({
          label,
          percentage: parseFloat(percentage.toFixed(1)),
        })),
        topCountries,
        deviceTypes,
        peakHours,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Routes
  const buildChannelContext = (channel: any, videos: any[], analytics: any[], goalMode: string) => {
    const totalViews = analytics.reduce((s, d) => s + d.views, 0);
    const totalWatchTime = analytics.reduce((s, d) => s + d.watchTimeMinutes, 0);
    const totalSubGain = analytics.reduce((s, d) => s + d.subscriberGain, 0);
    const avgViews = videos.length
      ? Math.round(videos.reduce((s, v) => s + v.views, 0) / videos.length)
      : 0;
    const avgEngagement = videos.length
      ? parseFloat(
          (
            videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length
          ).toFixed(2)
        )
      : 0;

    const topVideo = [...videos].sort((a, b) => b.views - a.views)[0];
    const worstVideo = [...videos].sort(
      (a, b) => a.engagementRate - b.engagementRate
    )[0];

    const recentVideos = videos
      .slice(0, 5)
      .map(
        (v) =>
          `  - "${v.title}" | ${v.views.toLocaleString()} views | ${
            v.engagementRate
          }% engagement | ${v.likes} likes`
      )
      .join("\n");

    return `
CHANNEL: ${channel.name} (${channel.handle})
SUBSCRIBERS: ${channel.subscriberCount?.toLocaleString()}
TOTAL VIEWS: ${channel.totalViews?.toLocaleString()}
VIDEO COUNT: ${channel.videoCount}
CREATOR GOAL: ${goalMode}

LAST 28 DAYS PERFORMANCE:
- Views: ${totalViews.toLocaleString()}
- Watch time: ${Math.round(totalWatchTime / 60).toLocaleString()} hours
- Subscriber gain: ${totalSubGain > 0 ? "+" : ""}${totalSubGain.toLocaleString()}
- Avg views per video: ${avgViews.toLocaleString()}
- Avg engagement rate: ${avgEngagement}%

RECENT VIDEOS:
${recentVideos}

TOP PERFORMER: "${topVideo?.title}" (${topVideo?.views?.toLocaleString()} views)
LOWEST ENGAGEMENT: "${worstVideo?.title}" (${
      worstVideo?.engagementRate
    }% engagement)
`.trim();
  };

  app.post("/api/ai/chat", async (req, res) => {
    const { messages, channelId, goalMode, channel, videos, analytics } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);

    try {
      const stream = await anthropic.messages.stream({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 600,
        system: `You are the AI co-pilot for CreatorPulse, a YouTube analytics platform.
You have LIVE access to this creator's channel data:

${context}

Your role:
- Give SPECIFIC, DATA-GROUNDED advice referencing their ACTUAL numbers
- NEVER give generic YouTube tips that don't reference their data
- Be direct and concise — default to under 100 words unless asked for detail
- When they ask about performance, compare to their own averages, not generic benchmarks
- Format any lists with line breaks, not markdown bullet syntax
- Do not use asterisks or markdown bold`,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      });

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");

      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          res.write(chunk.delta.text);
        }
      }
      res.end();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/strategy", async (req, res) => {
    const { channelId, goalMode, channel, videos, analytics } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: `You are a YouTube growth strategist with access to this creator's live channel data:

${context}

Generate a 5-day content strategy plan for this week. For each day (Monday–Friday), output EXACTLY this JSON structure:
{
  "plan": [
    {
      "day": "Monday",
      "format": "Long-form" | "Short" | "Community Post",
      "title": "specific video title idea",
      "keyword": "primary target keyword",
      "reasoning": "1 sentence why this fits their data",
      "estimatedReachMultiplier": 1.0 to 3.0
    }
  ]
}

Base suggestions on their real performance data. Reference their actual numbers.
Respond ONLY with valid JSON.`,
        messages: [{ role: "user", content: "Generate this week's content plan." }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      res.json(JSON.parse(text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/hashtags", async (req, res) => {
    const { topic, niche, youtubeSEOMode } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    const userPrompt = `
Topic/Title: "${topic}"
Niche: ${niche || "general"}
YouTube SEO Mode: ${
      youtubeSEOMode ? "enabled — optimize for YouTube search ranking" : "disabled"
    }

Generate hashtags and SEO content for this YouTube video.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 800,
        system: `You are a YouTube SEO specialist. Generate hashtags and keywords for YouTube videos.

Output EXACTLY this JSON structure:
{
  "broad": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "niche": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"],
  "micro": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "titleVariants": [
    { "title": "...", "estimatedCTR": 6.2 },
    { "title": "...", "estimatedCTR": 5.8 },
    { "title": "...", "estimatedCTR": 4.9 }
  ],
  "descriptionKeywords": ["keyword1", "keyword2", "...up to 15 keywords"]
}

Rules:
- Broad tags: high volume, generic (1–3 words)
- Niche tags: medium competition, topic-specific (2–4 words)
- Micro tags: low competition, highly specific long-tail (3–6 words)
- All tags WITHOUT the # symbol
- Respond ONLY with valid JSON`,
        messages: [{ role: "user", content: userPrompt }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      res.json(JSON.parse(text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/opportunities", async (req, res) => {
    const { channelId, goalMode, channel, videos, analytics } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 800,
        system: `You are a YouTube content strategist analyzing a creator's channel for growth opportunities.

Creator data:
${context}

Identify exactly 3 growth opportunities. Output EXACTLY this JSON:
{
  "opportunities": [
    {
      "type": "content_gap" | "trending_topic" | "timing_gap",
      "title": "short opportunity title",
      "description": "1–2 sentences explaining the opportunity with specific data references",
      "action": "one specific actionable step",
      "estimatedImpact": "high" | "medium" | "low"
    }
  ]
}

Base everything on their real channel data. Reference their actual numbers.
Respond ONLY with valid JSON.`,
        messages: [
          {
            role: "user",
            content:
              "Identify the 3 highest-impact growth opportunities for this channel right now.",
          },
        ],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      res.json(JSON.parse(text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ai/simulate", async (req, res) => {
    const { channelId, goalMode, scenario, period, channel, videos, analytics } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);
    const weeks = Math.round(period / 7);

    const userPrompt = `
Scenario changes (vs current):
- Uploads per month: ${scenario.uploadsPerMonth}
- Avg video length: ${scenario.avgVideoLength}
- YouTube Shorts: ${
      scenario.usesShorts ? `Yes, ${scenario.shortsPerWeek}/week` : "No"
    }
- Monthly ad budget: $${scenario.adBudget}
- Content niche: ${scenario.niche}
- Active tactics: ${scenario.tactics.join(", ")}

Project growth for ${weeks} weeks (${period} days).
Current subscribers: ${channel?.subscriberCount?.toLocaleString() || 0}
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1200,
        system: `You are a YouTube growth modeling AI. Given a creator's current data and proposed changes,
project their growth over a specified period.

Current channel data:
${context}

Given the scenario variables provided, output EXACTLY this JSON:
{
  "projections": [
    { "week": 1, "subscribers": 12340, "views": 45000 },
    ...
  ],
  "summary": {
    "projectedSubscriberGain": 1200,
    "projectedViewIncrease": 45000,
    "projectedRevenueImpact": 120,
    "confidenceLevel": "medium",
    "keyInsight": "1 sentence key takeaway"
  }
}

The projections array should have one entry per week for the requested period.
Start each week's subscribers/views from the creator's current values.
Model realistic growth curves — not linear, use slight compounding.
Respond ONLY with valid JSON.`,
        messages: [{ role: "user", content: userPrompt }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      res.json(JSON.parse(text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
