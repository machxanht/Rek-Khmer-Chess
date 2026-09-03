// Procedural audio system for Rek Khmer.
// 100% offline: Web Audio only, no remote samples or runtime dependencies.

class SoundManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private muted = false
  private voiceEnabled = true

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.muted = localStorage.getItem('rek_sound_muted') === 'true'
        this.voiceEnabled = localStorage.getItem('rek_voice_enabled') !== 'false'
      } catch {}
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    let createdContext: AudioContext | null = null

    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

        if (!AudioCtx) return null

        createdContext = new AudioCtx()
        const compressor = createdContext.createDynamicsCompressor()
        const master = createdContext.createGain()

        compressor.threshold.value = -18
        compressor.knee.value = 18
        compressor.ratio.value = 3.2
        compressor.attack.value = 0.003
        compressor.release.value = 0.2
        master.gain.value = 0.72

        compressor.connect(master)
        master.connect(createdContext.destination)

        this.ctx = createdContext
        this.compressor = compressor
        this.master = master
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }

      return this.ctx
    } catch {
      if (createdContext) {
        createdContext.close().catch(() => {})
      }
      this.ctx = null
      this.compressor = null
      this.master = null
      return null
    }
  }

  private connect(node: AudioNode): void {
    if (this.compressor) {
      node.connect(this.compressor)
    } else {
      node.connect((node.context as AudioContext).destination)
    }
  }

  private noiseBurst(
    ctx: AudioContext,
    start: number,
    duration: number,
    volume: number,
    frequency: number,
    q = 0.8,
  ): void {
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const envelope = 1 - i / length
      data[i] = (Math.random() * 2 - 1) * envelope
    }

    const source = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    source.buffer = buffer
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(frequency, start)
    filter.Q.setValueAtTime(q, start)
    gain.gain.setValueAtTime(Math.max(0.0001, volume), start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    source.connect(filter)
    filter.connect(gain)
    this.connect(gain)
    source.start(start)
    source.stop(start + duration + 0.01)
  }

  private woodHit(
    ctx: AudioContext,
    start: number,
    strength = 1,
    pitch = 170,
  ): void {
    const body = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    const resonance = ctx.createBiquadFilter()

    body.type = 'triangle'
    body.frequency.setValueAtTime(pitch * 1.75, start)
    body.frequency.exponentialRampToValueAtTime(pitch, start + 0.055)

    resonance.type = 'lowpass'
    resonance.frequency.setValueAtTime(920, start)
    resonance.Q.setValueAtTime(0.75, start)

    bodyGain.gain.setValueAtTime(0.22 * strength, start)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09)

    body.connect(resonance)
    resonance.connect(bodyGain)
    this.connect(bodyGain)
    body.start(start)
    body.stop(start + 0.1)

    this.noiseBurst(ctx, start, 0.045, 0.08 * strength, 1450, 0.65)
  }

  private bronzeBell(
    ctx: AudioContext,
    start: number,
    fundamental: number,
    duration: number,
    volume = 0.16,
  ): void {
    const partials = [1, 2.01, 2.67, 4.15]
    const weights = [1, 0.42, 0.25, 0.13]

    partials.forEach((partial, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const startVolume = volume * weights[index]

      osc.type = index === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(fundamental * partial, start)
      osc.detune.setValueAtTime(index % 2 === 0 ? -3 : 4, start)

      gain.gain.setValueAtTime(Math.max(0.0001, startVolume), start)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

      osc.connect(gain)
      this.connect(gain)
      osc.start(start)
      osc.stop(start + duration + 0.02)
    })
  }

  public isMuted(): boolean {
    return this.muted
  }

  public setMuted(muted: boolean): void {
    this.muted = muted
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rek_sound_muted', muted ? 'true' : 'false')
      } catch {}
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
      try {
        localStorage.setItem('rek_voice_enabled', this.voiceEnabled ? 'true' : 'false')
      } catch {}
    }
    return this.voiceEnabled
  }

  public playSelect(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.woodHit(ctx, now, 0.48, 225)
      this.bronzeBell(ctx, now + 0.008, 610, 0.12, 0.035)
    } catch {}
  }

  public playMove(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.noiseBurst(ctx, now, 0.07, 0.045, 980, 0.5)
      this.woodHit(ctx, now + 0.035, 0.9, 145)
    } catch {}
  }

  public playCapture(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.woodHit(ctx, now, 1.05, 128)
      this.woodHit(ctx, now + 0.055, 0.72, 178)
      this.bronzeBell(ctx, now + 0.015, 155, 0.42, 0.08)
    } catch {}
  }

  public playRek(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.woodHit(ctx, now, 0.95, 138)

      ;[523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        this.bronzeBell(ctx, now + 0.045 + index * 0.052, frequency, 0.42, 0.085)
      })

      this.bronzeBell(ctx, now, 112, 0.72, 0.16)
      this.speakVoice('រែក!')
    } catch {}
  }

  public playPoat(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.woodHit(ctx, now, 0.8, 150)

      ;[880, 739.99, 622.25, 523.25].forEach((frequency, index) => {
        this.bronzeBell(ctx, now + 0.035 + index * 0.06, frequency, 0.4, 0.075)
      })

      this.bronzeBell(ctx, now + 0.02, 132, 0.6, 0.12)
      this.speakVoice('ព័ទ្ធ!')
    } catch {}
  }

  public playHaoRek(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.bronzeBell(ctx, now, 440, 0.36, 0.12)
      this.bronzeBell(ctx, now + 0.18, 660, 0.42, 0.12)
      this.woodHit(ctx, now + 0.17, 0.6, 165)
      this.speakVoice('ហៅរែក!')
    } catch {}
  }

  public playVictory(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5]

      melody.forEach((frequency, index) => {
        this.bronzeBell(
          ctx,
          now + index * 0.12,
          frequency,
          index === melody.length - 1 ? 0.95 : 0.62,
          0.12,
        )
      })

      this.bronzeBell(ctx, now + 0.02, 98, 1.1, 0.15)
    } catch {}
  }

  public playDefeat(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.bronzeBell(ctx, now, 196, 0.72, 0.13)
      this.bronzeBell(ctx, now + 0.18, 146.83, 0.82, 0.11)
      this.woodHit(ctx, now + 0.22, 0.45, 105)
    } catch {}
  }

  public playDraw(): void {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      this.bronzeBell(ctx, now, 392, 0.65, 0.09)
      this.bronzeBell(ctx, now + 0.16, 392, 0.7, 0.07)
      this.bronzeBell(ctx, now + 0.32, 293.66, 0.82, 0.08)
      this.woodHit(ctx, now + 0.31, 0.38, 132)
    } catch {}
  }

  private speakVoice(text: string): void {
    if (!this.voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return

    try {
      const voices = window.speechSynthesis.getVoices()
      const khmerVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('km'))
      if (!khmerVoice) return

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = khmerVoice.lang
      utterance.voice = khmerVoice
      utterance.rate = 0.94
      utterance.pitch = 1
      utterance.volume = 0.48
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    } catch {}
  }
}

export const sounds = new SoundManager()
