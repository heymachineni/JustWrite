/**
 * Local, deterministic stand-in for a hosted model so the AI editor works
 * fully offline. Swap `generate` for a real streaming endpoint later.
 */
export type AIPreset = "proofread" | "shorten" | "improve" | "ask";

function sentenceCase(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s*([.!?])\s*/g, "$1 ")
    .trim()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

export function generate(preset: AIPreset, prompt: string, input: string): string {
  const text = input.trim();

  switch (preset) {
    case "proofread": {
      if (!text) return "";
      let out = sentenceCase(text);
      if (!/[.!?]$/.test(out)) out += ".";
      return out;
    }
    case "shorten": {
      if (!text) return "";
      const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
      const keep = Math.max(1, Math.ceil(sentences.length * 0.5));
      return sentences.slice(0, keep).join(" ");
    }
    case "improve": {
      if (!text) return "";
      return sentenceCase(text);
    }
    case "ask":
    default: {
      const q = prompt.trim();
      if (!q) return "";
      return (
        `Here's a draft based on “${q}”:\n\n` +
        (text
          ? `Considering your text, a clear way to put it: ${sentenceCase(text)}`
          : `This is a local preview of the AI editor. Connect a model to get real answers — the interface, streaming, and accept/reject flow all work as they would in production.`)
      );
    }
  }
}

/** Reveal the output progressively to mimic token streaming. */
export function streamGenerate(
  full: string,
  onChunk: (partial: string) => void,
  onDone: () => void
): () => void {
  let i = 0;
  const step = Math.max(1, Math.round(full.length / 60));
  const timer = setInterval(() => {
    i = Math.min(full.length, i + step);
    onChunk(full.slice(0, i));
    if (i >= full.length) {
      clearInterval(timer);
      onDone();
    }
  }, 18);
  return () => clearInterval(timer);
}
