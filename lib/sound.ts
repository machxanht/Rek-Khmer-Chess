// Enhanced Web Audio API Synthesizer for Authentic Khmer Rek Game
// 100% offline, zero external dependencies, ultra-responsive audio engine.

class SoundManager {
  private ctx: AudioContext | null = null
  private muted: boolean = false
  private voiceEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rek_sound_muted')
      this.muted = saved === 'true'
      const savedVoice = localStorage.getItem('rek_voice_enabled')
      this.voiceEnabled = savedVoice !== 'false'
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public isMuted(): boolean {
    return this.muted
  }

  public setMuted(muted: boolean): void {
    this.muted = muted
    if (typeof window !== 'undefined') {
      localStorage.setItem('rek_sound_muted', muted ? 'true' : 'false')
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted)
    return this.muted
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled
  }

  public toggleVoice(): boolean {
    this.voiceEnabled = !this.voiceEnabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('rek_voice_enabled', this.voiceEnabled ? 'true' : 'false')
    }
    return this.voiceEnabled
  }

  // Soft teak wood piece select tap
  public playSelect(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch {}
  }

  // Teak wood slide & solid placement clack
  public playMove(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      // Wood transient impact
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.07)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(now + 0.09)
    } catch {}
  }

  // Standard capture snap
  public playCapture(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sawtooth'
      osc1.frequency.setValueAtTime(380, now)
      osc1.frequency.exponentialRampToValueAtTime(70, now + 0.14)
      gain1.gain.setValueAtTime(0.3, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start()
      osc1.stop(now + 0.16)
    } catch {}
  }

  // Glorious "REK" Flanking Chime (Golden harmonic arpeggio + deep bronze resonance)
  public playRek(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5] // C5, E5, G5, C6, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.05)

        gain.gain.setValueAtTime(0.2, now + i * 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.05)
        osc.stop(now + i * 0.05 + 0.46)
      })

      // Deep gong undertone
      const gongOsc = ctx.createOscillator()
      const gongGain = ctx.createGain()
      gongOsc.type = 'triangle'
      gongOsc.frequency.setValueAtTime(160, now)
      gongOsc.frequency.exponentialRampToValueAtTime(80, now + 0.5)
      gongGain.gain.setValueAtTime(0.25, now)
      gongGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
      gongOsc.connect(gongGain)
      gongGain.connect(ctx.destination)
      gongOsc.start(now)
      gongOsc.stop(now + 0.56)

      this.speakVoice('រែក!')
    } catch {}
  }

  // "POAT" Encirclement Harmonic Cascade
  public playPoat(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [880, 783.99, 659.25, 523.25, 440] // A5 down to A4 cascade
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + i * 0.06)
        gain.gain.setValueAtTime(0.18, now + i * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.06)
        osc.stop(now + i * 0.06 + 0.42)
      })

      this.speakVoice('ព័ទ្ធ!')
    } catch {}
  }

  // "HAO REK" Warning Alert Gong
  public playHaoRek(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.42)

      this.speakVoice('ហៅរែក!')
    } catch {}
  }

  // Royal Victory Fanfare
  public playVictory(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const melody = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.18 }, // G5
        { f: 1046.5, d: 0.45 }, // C6
        { f: 1318.5, d: 0.6 },  // E6
      ]
      let t = now
      melody.forEach((note) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(note.f, t)
        gain.gain.setValueAtTime(0.28, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + note.d + 0.02)
        t += note.d * 0.8
      })
    } catch {}
  }

  // Defeat / Temple Bell Tone
  public playDefeat(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.linearRampToValueAtTime(90, now + 0.5)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.56)
    } catch {}
  }

  // Khmer Voiceover Announcer (Fallback to Web Speech if supported)
  private speakVoice(text: string): void {
    if (!this.voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = 1.2
      utterance.volume = 0.6
      window.speechSynthesis.speak(utterance)
    } catch {}
  }
}

export const sounds = new SoundManager()
