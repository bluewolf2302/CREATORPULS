import { create } from 'zustand'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatStore {
  messages: Message[]
  isStreaming: boolean
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void
  appendToLast: (text: string) => void
  setStreaming: (v: boolean) => void
  clear: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,

  addMessage: (msg) => set((s) => ({
    messages: [...s.messages, {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }]
  })),

  appendToLast: (text) => set((s) => {
    const msgs = [...s.messages]
    if (msgs.length === 0) return s
    msgs[msgs.length - 1] = {
      ...msgs[msgs.length - 1],
      content: msgs[msgs.length - 1].content + text,
    }
    return { messages: msgs }
  }),

  setStreaming: (v) => set({ isStreaming: v }),
  clear: () => set({ messages: [] }),
}))
