let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function initAudio(): void {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
}

function beep(freq: number, duration: number, volume = 0.4): void {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch {
    // audio not available
  }
}

export function playWorkBeep(): void {
  beep(880, 0.12)
}

export function playRestBeep(): void {
  beep(440, 0.25, 0.35)
}

export function playFinishBeep(): void {
  beep(660, 0.1)
  setTimeout(() => beep(880, 0.1), 140)
  setTimeout(() => beep(1100, 0.3), 280)
}
