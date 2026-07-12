import { create } from 'zustand'

type ViewMode = 'beginner' | 'formula'
type SimulationState = {
  stage: number
  playing: boolean
  speed: number
  mode: ViewMode
  setStage: (stage: number) => void
  next: (max: number) => void
  previous: () => void
  togglePlaying: () => void
  setPlaying: (playing: boolean) => void
  setSpeed: (speed: number) => void
  setMode: (mode: ViewMode) => void
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  stage: 0,
  playing: false,
  speed: 1,
  mode: 'beginner',
  setStage: (stage) => set({ stage, playing: false }),
  next: (max) => set((state) => ({ stage: Math.min(state.stage + 1, max) })),
  previous: () => set((state) => ({ stage: Math.max(state.stage - 1, 0), playing: false })),
  togglePlaying: () => set((state) => ({ playing: !state.playing })),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  setMode: (mode) => set({ mode }),
  reset: () => set({ stage: 0, playing: false }),
}))
