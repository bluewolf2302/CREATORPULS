import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

export async function* streamChat(messages: any[], channel: any, videos: any[], analytics: any[], goalMode: string) {
  const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);
  
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction: `You are the AI co-pilot for CreatorPulse, a YouTube analytics platform.
You have LIVE access to this creator's channel data:

${context}

Your role:
- Give SPECIFIC, DATA-GROUNDED advice referencing their ACTUAL numbers
- NEVER give generic YouTube tips that don't reference their data
- Be direct and concise — default to under 100 words unless asked for detail
- When they ask about performance, compare to their own averages, not generic benchmarks
- Format any lists with line breaks, not markdown bullet syntax
- Do not use asterisks or markdown bold`,
    }
  });

  for await (const chunk of response) {
    yield chunk.text;
  }
}

export async function getStrategy(channel: any, videos: any[], analytics: any[], goalMode: string) {
  const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate this week's content plan.",
    config: {
      systemInstruction: `You are a YouTube growth strategist with access to this creator's live channel data:

${context}

Generate a 5-day content strategy plan for this week. For each day (Monday–Friday), suggest a video idea.
Base suggestions on their real performance data. Reference their actual numbers.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                format: { type: Type.STRING, enum: ["Long-form", "Short", "Community Post"] },
                title: { type: Type.STRING },
                keyword: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                estimatedReachMultiplier: { type: Type.NUMBER }
              },
              required: ["day", "format", "title", "keyword", "reasoning", "estimatedReachMultiplier"]
            }
          }
        },
        required: ["plan"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getHashtags(topic: string, niche: string, youtubeSEOMode: boolean) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Topic/Title: "${topic}"
Niche: ${niche || "general"}
YouTube SEO Mode: ${youtubeSEOMode ? "enabled" : "disabled"}`,
    config: {
      systemInstruction: `You are a YouTube SEO specialist. Generate hashtags and keywords for YouTube videos.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          broad: { type: Type.ARRAY, items: { type: Type.STRING } },
          niche: { type: Type.ARRAY, items: { type: Type.STRING } },
          micro: { type: Type.ARRAY, items: { type: Type.STRING } },
          titleVariants: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                estimatedCTR: { type: Type.NUMBER }
              },
              required: ["title", "estimatedCTR"]
            }
          },
          descriptionKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["broad", "niche", "micro", "titleVariants", "descriptionKeywords"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getOpportunities(channel: any, videos: any[], analytics: any[], goalMode: string) {
  const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Identify the 3 highest-impact growth opportunities for this channel right now.",
    config: {
      systemInstruction: `You are a YouTube content strategist analyzing a creator's channel for growth opportunities.

Creator data:
${context}`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          opportunities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["content_gap", "trending_topic", "timing_gap"] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                action: { type: Type.STRING },
                estimatedImpact: { type: Type.STRING, enum: ["high", "medium", "low"] }
              },
              required: ["type", "title", "description", "action", "estimatedImpact"]
            }
          }
        },
        required: ["opportunities"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function simulateGrowth(scenario: any, period: number, channel: any, videos: any[], analytics: any[], goalMode: string) {
  const context = buildChannelContext(channel || {}, videos || [], analytics || [], goalMode);
  const weeks = Math.round(period / 7);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Scenario: ${JSON.stringify(scenario)}
Period: ${period} days (${weeks} weeks)
Current Subscribers: ${channel?.subscriberCount}`,
    config: {
      systemInstruction: `You are a YouTube growth modeling AI. Given a creator's current data and proposed changes, project their growth.
Current channel data:
${context}`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.NUMBER },
                subscribers: { type: Type.NUMBER },
                views: { type: Type.NUMBER }
              },
              required: ["week", "subscribers", "views"]
            }
          },
          summary: {
            type: Type.OBJECT,
            properties: {
              projectedSubscriberGain: { type: Type.NUMBER },
              projectedViewIncrease: { type: Type.NUMBER },
              projectedRevenueImpact: { type: Type.NUMBER },
              confidenceLevel: { type: Type.STRING, enum: ["high", "medium", "low"] },
              keyInsight: { type: Type.STRING }
            },
            required: ["projectedSubscriberGain", "projectedViewIncrease", "projectedRevenueImpact", "confidenceLevel", "keyInsight"]
          }
        },
        required: ["projections", "summary"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
