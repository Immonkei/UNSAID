// Procedural Web Audio API sound generator for UNSAID ambient soundscapes
// Zero external audio files required, zero copyright issues, works offline, infinite loop, low memory footprint.

export type SoundTrack = 'none' | 'rain' | 'train' | 'tape';

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: SoundTrack = 'none';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.45;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): SoundTrack {
    return this.currentTrack;
  }

  public stop() {
    this.currentTrack = 'none';
    if (!this.ctx || !this.masterGain) return;

    // Fade out smoothly
    try {
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        this.cleanupNodes();
      }, 550);
    } catch {
      this.cleanupNodes();
    }
  }

  private cleanupNodes() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore disconnect errors on already stopped nodes
        }
      }
    });
    this.activeNodes = [];
  }

  public play(track: SoundTrack) {
    if (track === this.currentTrack && track !== 'none') {
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.cleanupNodes();
    this.currentTrack = track;

    // Reset gain
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.6);

    switch (track) {
      case 'rain':
        this.startRainSound();
        break;
      case 'train':
        this.startTrainSound();
        break;
      case 'tape':
        this.startTapeHissSound();
        break;
      case 'none':
      default:
        this.stop();
        break;
    }
  }

  /**
   * Generates procedural gentle rain on window glass using pink noise + biquad lowpass filtering.
   */
  private startRainSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.045; // lower base volume
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops muffled by glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  /**
   * Generates rhythmic, muffled midnight train rolling on tracks through a distant valley.
   */
  private startTrainSound() {
    if (!this.ctx || !this.masterGain) return;

    // Low rumble oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(54, this.ctx.currentTime);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Filter to keep it deep & distant
    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(180, this.ctx.currentTime);

    osc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    osc.start();

    // Rhythmic rail click-clack noise bursts
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const clickFilter = this.ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    clickFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);

    // Play rhythmic clack pulses every 1.8s (ta-dum... ta-dum)
    const intervalId = window.setInterval(() => {
      if (!this.ctx || this.currentTrack !== 'train') return;
      try {
        const playClack = (delay: number, vol: number) => {
          if (!this.ctx) return;
          const src = this.ctx.createBufferSource();
          src.buffer = noiseBuffer;
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
          src.connect(clickFilter);
          src.start(this.ctx.currentTime + delay);
        };
        playClack(0, 0.09);
        playClack(0.18, 0.07);
        playClack(0.55, 0.08);
        playClack(0.73, 0.06);
      } catch {
        // AudioContext might be interrupted
      }
    }, 1800);

    this.activeNodes.push(osc, rumbleGain, rumbleFilter, clickFilter, clickGain, intervalId);
  }

  /**
   * Generates nostalgic vintage cassette tape hiss and warm vinyl crackle.
   */
  private startTapeHissSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Warm pink noise with occasional vinyl speckles
      const base = (Math.random() * 2 - 1) * 0.02;
      const crackle = Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.35 : 0;
      data[i] = base + crackle;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Highpass to eliminate mud + lowpass to give vintage warmth
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(320, this.ctx.currentTime);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, this.ctx.currentTime);

    source.connect(hp);
    hp.connect(lp);
    lp.connect(this.masterGain);
    source.start();

    this.activeNodes.push(source, hp, lp);
  }
}

// Export singleton engine
export const soundscape = typeof window !== 'undefined' ? new SoundscapeEngine() : null;
