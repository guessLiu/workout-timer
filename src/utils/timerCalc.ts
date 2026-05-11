import type { TimerPhase, WorkoutTemplate } from '../types'

export function computeTimerPhase(
  template: WorkoutTemplate,
  startedAt: number,
  totalPausedMs: number,
  now: number = Date.now()
): TimerPhase {
  const { workSeconds, restSeconds, rounds } = template
  const roundDuration = workSeconds + restSeconds
  const totalDuration = roundDuration * rounds

  const elapsedMs = Math.max(0, now - startedAt - totalPausedMs)
  const elapsedSec = elapsedMs / 1000

  if (elapsedSec >= totalDuration) {
    return { phase: 'finished', remaining: 0, phaseProgress: 1, currentRound: rounds, totalRounds: rounds }
  }

  const currentRoundIndex = Math.floor(elapsedSec / roundDuration)
  const currentRound = currentRoundIndex + 1
  const phaseElapsed = elapsedSec % roundDuration

  if (phaseElapsed < workSeconds) {
    return {
      phase: 'work',
      remaining: workSeconds - phaseElapsed,
      phaseProgress: phaseElapsed / workSeconds,
      currentRound,
      totalRounds: rounds,
    }
  } else {
    const restElapsed = phaseElapsed - workSeconds
    return {
      phase: 'rest',
      remaining: restSeconds - restElapsed,
      phaseProgress: restElapsed / restSeconds,
      currentRound,
      totalRounds: rounds,
    }
  }
}

// Returns new totalPausedMs that skips to the next phase
export function computeSkip(
  template: WorkoutTemplate,
  startedAt: number,
  totalPausedMs: number,
  now: number = Date.now()
): number {
  const { workSeconds, restSeconds } = template
  const roundDuration = workSeconds + restSeconds

  const elapsedMs = now - startedAt - totalPausedMs
  const elapsedSec = elapsedMs / 1000
  const phaseElapsed = elapsedSec % roundDuration

  const remainingInPhaseSec =
    phaseElapsed < workSeconds
      ? workSeconds - phaseElapsed
      : roundDuration - phaseElapsed

  // Subtract from totalPausedMs to make elapsed larger
  return totalPausedMs - remainingInPhaseSec * 1000 - 50
}
