/**
 * Real typewriter key strike — CC0 sample from BigSoundBank (#2842, Hermes Precisa 305).
 * https://bigsoundbank.com/typewriter-key-s2842.html
 */

const SAMPLE_URLS = ["/audio/typewriter/key.mp3"];

let audioContext: AudioContext | null = null;
let samples: AudioBuffer[] = [];
let loadPromise: Promise<void> | null = null;

async function loadSamples(ctx: AudioContext): Promise<void> {
  if (samples.length > 0) return;
  if (loadPromise) {
    await loadPromise;
    return;
  }

  loadPromise = (async () => {
    const buffers = await Promise.all(
      SAMPLE_URLS.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${url}`);
        const data = await res.arrayBuffer();
        return ctx.decodeAudioData(data);
      })
    );
    samples = buffers;
  })();

  try {
    await loadPromise;
  } catch {
    samples = [];
    loadPromise = null;
  }
}

export async function primeTypewriterAudio(): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "closed") {
    audioContext = new AudioContext();
    samples = [];
    loadPromise = null;
  }

  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch {
      return null;
    }
  }

  await loadSamples(audioContext);
  return audioContext;
}

export function releaseTypewriterAudio() {
  samples = [];
  loadPromise = null;
  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
}

export function playTypewriterClick(ctx: AudioContext) {
  if (samples.length === 0) return;

  const buffer = samples[Math.floor(Math.random() * samples.length)];
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 0.93 + Math.random() * 0.14;

  const gain = ctx.createGain();
  const peak = 0.75 + Math.random() * 0.2;
  gain.gain.setValueAtTime(peak, ctx.currentTime);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export async function playTypewriterClickOnce(): Promise<void> {
  const ctx = await primeTypewriterAudio();
  if (!ctx) return;
  playTypewriterClick(ctx);
}
