import { useState } from 'react'
import { useChatStore } from '../store/chat'
import { useChannelStore } from '../store/channel'
import { useGoalStore } from '../store/goalMode'

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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          channelId: channel?.id,
          goalMode,
          channel,
          videos,
          analytics
        }),
      })

      if (!response.body) throw new Error('No stream')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        appendToLast(decoder.decode(value, { stream: true }))
      }
    } catch (err) {
      appendToLast('Sorry, I ran into an error. Please try again.')
    } finally {
      setStreaming(false)
    }
  }

  return { messages, sendMessage, isStreaming }
}
