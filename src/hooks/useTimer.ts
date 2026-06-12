import { useState, useEffect, useRef, useCallback } from 'react'
import type { TimerState, WorkoutTemplate } from '../types'
import { computeTimerPhase, computeSkip } from '../utils/timerCalc'
import {
  initAudio,
  playStartBeep,
  playHalfwayBeep,
  playCountdownBeep,
  playRestBeep,
  playFinishBeep,
} from '../utils/audio'

const IDLE: TimerState = {
  status: 'idle',
  templateId: null,
  startedAt: null,
  pausedAt: null,
  totalPausedMs: 0,
}

export function useTimer(template: WorkoutTemplate | null) {
  const [state, setState] = useState<TimerState>(IDLE)
  const [tick, setTick] = useState(0)

  const stateRef = useRef(state)
  stateRef.current = state
  const templateRef = useRef(template)
  templateRef.current = template

  const lastPhaseKeyRef = useRef<string | null>(null)
  // Tracks which phase we've already played the halfway beep for
  const halfwayPlayedRef = useRef<string | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Interval: phase transitions + halfway beep + re-renders
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = stateRef.current
      const t = templateRef.current
      if (s.status !== 'running' || !s.startedAt || !t) return

      const phase = computeTimerPhase(t, s.startedAt, s.totalPausedMs)
      const key = `${phase.phase}-${phase.currentRound}`

      // Phase transition
      if (lastPhaseKeyRef.current !== null && lastPhaseKeyRef.current !== key) {
        halfwayPlayedRef.current = null
        if (phase.phase === 'work') {
          // Work starts again after rest — same double beep as start
          playStartBeep()
        } else if (phase.phase === 'rest') {
          playRestBeep()
        } else if (phase.phase === 'finished') {
          playFinishBeep()
          const finished: TimerState = { ...s, status: 'finished' }
          stateRef.current = finished
          setState(finished)
        }
      }
      lastPhaseKeyRef.current = key

      // Halfway beep: fires once when remaining crosses half of work phase (not rest)
      if (phase.phase === 'work' && halfwayPlayedRef.current !== key) {
        if (phase.remaining <= t.workSeconds / 2) {
          halfwayPlayedRef.current = key
          playHalfwayBeep()
        }
      }

      setTick(n => n + 1)
    }, 100)

    return () => clearInterval(id)
  }, [])

  // Wake lock when running
  useEffect(() => {
    if (state.status === 'running') {
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(lock => {
          wakeLockRef.current = lock
        }).catch(() => {})
      }
    } else {
      wakeLockRef.current?.release().catch(() => {})
      wakeLockRef.current = null
    }
  }, [state.status])

  // Reset when template changes
  useEffect(() => {
    if (template && stateRef.current.templateId && stateRef.current.templateId !== template.id) {
      const next: TimerState = { ...IDLE, templateId: template.id }
      stateRef.current = next
      setState(next)
      lastPhaseKeyRef.current = null
      halfwayPlayedRef.current = null
    }
  }, [template])

  const currentPhase =
    (state.status === 'running' || state.status === 'finished') && state.startedAt && template
      ? computeTimerPhase(template, state.startedAt, state.totalPausedMs)
      : null

  // Countdown: useEffect fires exactly once per integer-second change
  // Last 4 seconds (4,3,2,1) → same tone each time
  const ceilRemaining =
    currentPhase && currentPhase.phase !== 'finished' && state.status === 'running'
      ? Math.ceil(currentPhase.remaining)
      : -1

  const phaseKey = currentPhase
    ? `${currentPhase.phase}-${currentPhase.currentRound}`
    : ''

  useEffect(() => {
    if (ceilRemaining < 1 || ceilRemaining > 4) return
    playCountdownBeep()
  }, [ceilRemaining, phaseKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    const t = templateRef.current
    if (!t) return
    initAudio()
    playStartBeep() // 嘟嘟
    const next: TimerState = {
      status: 'running',
      templateId: t.id,
      startedAt: Date.now(),
      pausedAt: null,
      totalPausedMs: 0,
    }
    stateRef.current = next
    setState(next)
    lastPhaseKeyRef.current = 'work-1'
    halfwayPlayedRef.current = null
  }, [])

  const pause = useCallback(() => {
    const s = stateRef.current
    if (s.status !== 'running') return
    const next: TimerState = { ...s, status: 'paused', pausedAt: Date.now() }
    stateRef.current = next
    setState(next)
  }, [])

  const resume = useCallback(() => {
    const s = stateRef.current
    if (s.status !== 'paused' || !s.pausedAt) return
    const next: TimerState = {
      ...s,
      status: 'running',
      pausedAt: null,
      totalPausedMs: s.totalPausedMs + (Date.now() - s.pausedAt),
    }
    stateRef.current = next
    setState(next)
  }, [])

  const reset = useCallback(() => {
    const t = templateRef.current
    const next: TimerState = { ...IDLE, templateId: t?.id ?? null }
    stateRef.current = next
    setState(next)
    lastPhaseKeyRef.current = null
    halfwayPlayedRef.current = null
  }, [])

  const skip = useCallback(() => {
    const s = stateRef.current
    const t = templateRef.current
    if (s.status !== 'running' || !s.startedAt || !t) return

    const newTotalPausedMs = computeSkip(t, s.startedAt, s.totalPausedMs)
    const newPhase = computeTimerPhase(t, s.startedAt, newTotalPausedMs)

    if (newPhase.phase === 'work') playStartBeep()
    else if (newPhase.phase === 'rest') playRestBeep()
    else if (newPhase.phase === 'finished') playFinishBeep()

    lastPhaseKeyRef.current = `${newPhase.phase}-${newPhase.currentRound}`
    halfwayPlayedRef.current = null

    const next: TimerState = { ...s, totalPausedMs: newTotalPausedMs }
    stateRef.current = next
    setState(next)
  }, [])

  void tick
  return { state, currentPhase, start, pause, resume, reset, skip }
}
