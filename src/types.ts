export type WorkoutTemplate = {
  id: string
  name: string
  workSeconds: number
  restSeconds: number
  rounds: number
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export type TimerState = {
  status: TimerStatus
  templateId: string | null
  startedAt: number | null
  pausedAt: number | null
  totalPausedMs: number
}

export type TimerPhase = {
  phase: 'work' | 'rest' | 'finished'
  remaining: number
  phaseProgress: number
  currentRound: number
  totalRounds: number
}
