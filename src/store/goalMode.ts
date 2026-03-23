import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type GoalMode = 'grow_views' | 'grow_subscribers' | 'monetize' | null

interface GoalStore {
  goalMode: GoalMode
  setGoalMode: (mode: GoalMode) => void
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goalMode: null,
      setGoalMode: (mode) => set({ goalMode: mode }),
    }),
    { name: 'creatorpulse-goal' }
  )
)
