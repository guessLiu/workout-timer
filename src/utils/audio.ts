let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function initAudio(): void {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  // Unlock speech synthesis on iOS — must be called from a user gesture
  if (typeof window.speechSynthesis !== 'undefined') {
    window.speechSynthesis.cancel()
    const unlock = new SpeechSynthesisUtterance(' ')
    unlock.volume = 0
    window.speechSynthesis.speak(unlock)
  }
}

function beep(freq: number, duration: number, volume = 0.9): void {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'triangle'
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

// 標準 嘟（880Hz）
function du(): void {
  beep(880, 0.18, 0.9)
}

// 開始 — 嘟嘟（兩聲）
export function playStartBeep(): void {
  du()
  setTimeout(du, 220)
}

// 到一半時間 — 語音「half」（initAudio 已暖機，iOS 也能播）
export function playHalfwayBeep(): void {
  try {
    const utterance = new SpeechSynthesisUtterance('half')
    utterance.lang = 'en-US'
    utterance.volume = 1
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  } catch {
    beep(660, 0.15, 0.9)
    setTimeout(() => beep(880, 0.25, 0.9), 180)
  }
}

// 倒數 4,3,2 — 低音；1 — 高音
export function playCountdownBeep(isFinal = false): void {
  if (isFinal) beep(1100, 0.2, 0.9)
  else beep(550, 0.15, 0.9)
}

// 切換到 Rest — 低音
export function playRestBeep(): void {
  beep(440, 0.3, 0.9)
}

// 完成 — 四聲遞升
export function playFinishBeep(): void {
  beep(660, 0.1, 0.9)
  setTimeout(() => beep(880, 0.1, 0.9), 150)
  setTimeout(() => beep(1100, 0.1, 0.9), 300)
  setTimeout(() => beep(1320, 0.35, 0.9), 450)
}

// 保留相容（不再使用）
export function playWorkBeep(): void { du() }
export function playCountdownTick(): void { du() }
export function playCountdownFinal(): void { du() }