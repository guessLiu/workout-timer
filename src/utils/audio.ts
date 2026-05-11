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
    // 5ms attack ramp — prevents iOS from gating/clipping sudden sounds
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch {
    // audio not available
  }
}

// 倒數 tick（5、4、3、2 秒）— 短促高頻
export function playCountdownTick(): void {
  beep(1050, 0.12, 0.38)
}

// 倒數最後 1 秒 — 更高更響，警示感
export function playCountdownFinal(): void {
  beep(1350, 0.18, 0.5)
}

// 切換到 Work — 兩聲遞升
export function playWorkBeep(): void {
  beep(880, 0.1, 0.45)
  setTimeout(() => beep(1100, 0.2, 0.5), 120)
}

// 切換到 Rest — 一聲低沉
export function playRestBeep(): void {
  beep(440, 0.35, 0.38)
}

// 完成 — 四聲遞升
export function playFinishBeep(): void {
  beep(660, 0.1, 0.4)
  setTimeout(() => beep(880, 0.1, 0.4), 150)
  setTimeout(() => beep(1100, 0.1, 0.4), 300)
  setTimeout(() => beep(1320, 0.35, 0.45), 450)
}
