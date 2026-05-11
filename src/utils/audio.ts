let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function initAudio(): void {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
}

function beep(freq: number, duration: number, volume = 0.45): void {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + duration)
  } catch {
    // audio not available
  }
}

// 標準 嘟（880Hz，所有提示音共用同一音調）
function du(): void {
  beep(880, 0.18, 0.5)
}

// 開始 — 嘟嘟（兩聲）
export function playStartBeep(): void {
  du()
  setTimeout(du, 220)
}

// 到一半時間 — 嘟（一聲）
export function playHalfwayBeep(): void {
  du()
}

// 倒數 4,3,2,1 — 嘟（同聲調，一聲）
export function playCountdownBeep(): void {
  du()
}

// 切換到 Rest — 低音（與 Work 提示有所區別）
export function playRestBeep(): void {
  beep(440, 0.3, 0.4)
}

// 完成 — 四聲遞升
export function playFinishBeep(): void {
  beep(660, 0.1, 0.4)
  setTimeout(() => beep(880, 0.1, 0.4), 150)
  setTimeout(() => beep(1100, 0.1, 0.4), 300)
  setTimeout(() => beep(1320, 0.35, 0.45), 450)
}

// 保留相容（不再使用）
export function playWorkBeep(): void { du() }
export function playCountdownTick(): void { du() }
export function playCountdownFinal(): void { du() }
