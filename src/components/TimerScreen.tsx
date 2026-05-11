import { useState, useRef } from 'react'
import type { WorkoutTemplate } from '../types'
import { useTimer } from '../hooks/useTimer'

interface Props {
  template: WorkoutTemplate | null
  onGoToTemplates: () => void
}

export default function TimerScreen({ template, onGoToTemplates }: Props) {
  const { state, currentPhase, start, pause, resume, reset, skip } = useTimer(template)
  const [resetArmed, setResetArmed] = useState(false)
  const resetTimerRef = useRef<number | null>(null)

  const isIdle = state.status === 'idle'
  const isRunning = state.status === 'running'
  const isPaused = state.status === 'paused'
  const isFinished = state.status === 'finished'

  const phase = currentPhase
  const displaySeconds = phase ? Math.ceil(phase.remaining) : (template?.workSeconds ?? 0)
  const progress = phase ? phase.phaseProgress : 0
  const phaseLabel = phase?.phase === 'work' ? 'WORK' : phase?.phase === 'rest' ? 'REST' : ''

  const phaseColor =
    phase?.phase === 'rest' ? 'var(--rest-color)' :
    isFinished ? 'var(--finish-color)' :
    'var(--work-color)'

  function handleReset() {
    if (isRunning) {
      if (!resetArmed) {
        setResetArmed(true)
        resetTimerRef.current = window.setTimeout(() => setResetArmed(false), 3000)
      } else {
        clearTimeout(resetTimerRef.current!)
        setResetArmed(false)
        reset()
      }
    } else {
      reset()
    }
  }

  function formatDuration(t: WorkoutTemplate): string {
    const total = (t.workSeconds + t.restSeconds) * t.rounds
    const m = Math.floor(total / 60)
    const s = total % 60
    return s === 0 ? `${m}m` : `${m}m ${s}s`
  }

  if (!template) {
    return (
      <div className="screen center-col">
        <p className="muted">No template selected.</p>
        <button className="btn btn-primary" onClick={onGoToTemplates}>Add Template</button>
      </div>
    )
  }

  return (
    <div className="screen timer-screen">
      {/* Top bar */}
      <div className="top-bar">
        <button className="btn-ghost" onClick={onGoToTemplates}>Templates</button>
        <span className="template-name">{template.name}</span>
        <span className="template-meta">{template.workSeconds}s / {template.restSeconds}s · {template.rounds} rounds</span>
      </div>

      {/* Main display */}
      <div className="timer-main" style={{ '--phase-color': phaseColor } as React.CSSProperties}>
        {isFinished ? (
          <>
            <div className="phase-label finish-label">FINISHED!</div>
            <div className="countdown finish-count">🎉</div>
            <div className="round-label">{template.name} · {formatDuration(template)}</div>
          </>
        ) : (
          <>
            {(isRunning || isPaused) && (
              <div className="phase-label">{phaseLabel}</div>
            )}
            {isIdle && <div className="phase-label idle-label">READY</div>}

            <div className="countdown" style={{ color: phaseColor }}>
              {displaySeconds}
            </div>

            {(isRunning || isPaused) && phase && (
              <>
                <div className="round-label">
                  Round {phase.currentRound} of {phase.totalRounds}
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress * 100}%`,
                      background: phaseColor,
                    }}
                  />
                </div>
              </>
            )}

            {isIdle && (
              <div className="idle-summary">
                {template.workSeconds}s work · {template.restSeconds}s rest · {template.rounds} rounds
                <br />
                Total: {formatDuration(template)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        {isFinished ? (
          <button className="btn btn-primary" onClick={reset}>Reset</button>
        ) : (
          <>
            <div className="main-controls">
              {isIdle && (
                <button className="btn btn-primary btn-xl" onClick={start}>Start</button>
              )}
              {isRunning && (
                <>
                  <button className="btn btn-secondary btn-xl" onClick={pause}>Pause</button>
                  <button className="btn btn-ghost btn-xl" onClick={skip}>Skip</button>
                </>
              )}
              {isPaused && (
                <button className="btn btn-primary btn-xl" onClick={resume}>Resume</button>
              )}
            </div>

            <div className="reset-row">
              <button
                className={`btn btn-danger-soft ${resetArmed ? 'armed' : ''}`}
                onClick={handleReset}
              >
                {resetArmed ? 'Tap again to reset' : 'Reset'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
