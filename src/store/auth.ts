import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  accessToken: string | null
  guestChannelId: string | null
  setAccessToken: (token: string | null) => void
  setGuestChannelId: (id: string | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      guestChannelId: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setGuestChannelId: (id) => set({ guestChannelId: id }),
    }),
    { name: 'creatorpulse-auth' }
  )
)
