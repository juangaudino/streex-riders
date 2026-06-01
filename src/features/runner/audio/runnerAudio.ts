import type { RunnerEntity } from "../runner.types";

type RunnerAudioContext = AudioContext & {
  webkitAudioContext?: typeof AudioContext;
};

type RunnerOscillatorWave = OscillatorType;

const MASTER_GAIN = 0.32;

export class RunnerAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private lastMoveAt = 0;

  async warm() {
    const context = this.ensureContext();
    if (context.state === "suspended") await context.resume();
    this.startAmbient();
  }

  setPaused(paused: boolean) {
    if (!this.ambientGain || !this.context) return;
    const now = this.context.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setTargetAtTime(paused ? 0.006 : 0.018, now, 0.16);
  }

  laneMove() {
    const context = this.context;
    if (!context || context.state !== "running") return;
    const nowMs = performance.now();
    if (nowMs - this.lastMoveAt < 90) return;
    this.lastMoveAt = nowMs;

    this.filteredNoise(0.07, 580, 0.028, "bandpass");
    this.tone(196, 238, 0.06, 0.018, "sine");
  }

  collect(kind: RunnerEntity["kind"]) {
    const context = this.context;
    if (!context || context.state !== "running") return;

    if (kind === "vipRide") {
      this.tone(392, 523, 0.16, 0.042, "sine");
      this.tone(784, 988, 0.24, 0.024, "triangle", 0.04);
      this.filteredNoise(0.2, 4600, 0.018, "highpass", 0.02);
      return;
    }

    if (kind === "airportRide") {
      this.tone(330, 440, 0.1, 0.032, "sine");
      this.tone(494, 659, 0.12, 0.026, "triangle", 0.08);
      return;
    }

    if (kind === "passengerPickup") {
      this.tone(262, 330, 0.11, 0.03, "sine");
      this.tone(392, 392, 0.14, 0.014, "triangle", 0.045);
      return;
    }

    if (kind === "reputationStar") {
      this.tone(880, 1175, 0.09, 0.018, "triangle");
      this.tone(1320, 1320, 0.08, 0.009, "sine", 0.035);
    }
  }

  skid() {
    const context = this.context;
    if (!context || context.state !== "running") return;
    this.filteredNoise(0.34, 850, 0.04, "bandpass");
    this.tone(130, 104, 0.24, 0.018, "sine");
  }

  crash() {
    const context = this.context;
    if (!context || context.state !== "running") return;
    this.filteredNoise(0.22, 260, 0.075, "lowpass");
    this.filteredNoise(0.3, 1800, 0.025, "bandpass", 0.04);
    this.tone(96, 56, 0.26, 0.055, "sine");
  }

  dispose() {
    this.stopAmbient();
    this.context?.close().catch(() => {});
    this.context = null;
    this.master = null;
  }

  private ensureContext() {
    if (this.context && this.master) return this.context;
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const context = new AudioCtor() as RunnerAudioContext;
    const master = context.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(context.destination);
    this.context = context;
    this.master = master;
    return context;
  }

  private startAmbient() {
    const context = this.context;
    const master = this.master;
    if (!context || !master || this.ambientSource) return;

    const bufferSize = context.sampleRate * 2;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.22;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.5;

    const gain = context.createGain();
    gain.gain.value = 0.018;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();

    this.ambientSource = source;
    this.ambientGain = gain;
  }

  private stopAmbient() {
    this.ambientSource?.stop();
    this.ambientSource?.disconnect();
    this.ambientGain?.disconnect();
    this.ambientSource = null;
    this.ambientGain = null;
  }

  private tone(
    fromHz: number,
    toHz: number,
    duration: number,
    gainValue: number,
    type: RunnerOscillatorWave,
    delay = 0,
  ) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(fromHz, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, toHz), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  private filteredNoise(
    duration: number,
    frequency: number,
    gainValue: number,
    type: BiquadFilterType,
    delay = 0,
  ) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;

    const start = context.currentTime + delay;
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = type === "bandpass" ? 1.1 : 0.65;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
    source.stop(start + duration + 0.02);
  }
}
