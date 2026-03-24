import { useState } from 'react'
import { useChatStore } from '../store/chat'
import { useChannelStore } from '../store/channel'
import { useGoalStore } from '../store/goalMode'
import { streamChat } from '../services/gemini'

export function useAIChat() {
  const { messages, addMessage, appendToLast, setStreaming, isStreaming } = useChatStore()
  const { channel, videos, analytics } = useChannelStore()
  const { goalMode } = useGoalStore()

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    addMessage({ role: 'user', content })
    addMessage({ role: 'assistant', content: '' })
    setStreaming(true)

    try {
      const stream = streamChat(
        [...messages, { role: 'user', content }],
        channel,
        videos,
        analytics,
        goalMode || 'Growth'
      );

      for await (const chunk of stream) {
        appendToLast(chunk || '');
      }
    } catch (err) {
      appendToLast('Sorry, I ran into an error. Please try again.')
    } finally {
      setStreaming(false)
    }
  }

  return { messages, sendMessage, isStreaming }
}
