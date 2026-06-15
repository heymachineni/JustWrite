"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";

const MELODY = [
  { freq: 523.25, type: "triangle" as OscillatorType },
  { freq: 659.25, type: "square" as OscillatorType },
  { freq: 783.99, type: "triangle" as OscillatorType },
  { freq: 440.0, type: "sine" as OscillatorType },
  { freq: 587.33, type: "triangle" as OscillatorType },
  { freq: 698.46, type: "square" as OscillatorType },
  { freq: 329.63, type: "sine" as OscillatorType },
  { freq: 392.0, type: "triangle" as OscillatorType },
];

const PERC_FREQS = [180, 220, 260];

/**
 * Playful typing music — bouncy melody notes, soft percussion, and a warm chord bed.
 */
export function useTypingMusic(active: boolean, editor: Editor | null) {
  const ctxRef = React.useRef<AudioContext | null>(null);
  const bedGainRef = React.useRef<GainNode | null>(null);
  const currentVol = React.useRef(0);
  const targetVol = React.useRef(0);
  const fadeTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLen = React.useRef(0);
  const noteIndex = React.useRef(0);

  React.useEffect(() => {
    if (!active) {
      if (fadeTimer.current) clearInterval(fadeTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
        bedGainRef.current = null;
      }
      currentVol.current = 0;
      targetVol.current = 0;
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const bedOscs = [146.83, 185.0, 220.0, 277.18].map((freq) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq;
      return o;
    });

    const bedGain = ctx.createGain();
    bedGain.gain.value = 0;
    bedOscs.forEach((o) => {
      o.connect(bedGain);
      o.start();
    });
    bedGain.connect(ctx.destination);
    bedGainRef.current = bedGain;

    fadeTimer.current = setInterval(() => {
      const diff = targetVol.current - currentVol.current;
      currentVol.current += diff * 0.16;
      if (bedGainRef.current) {
        bedGainRef.current.gain.value = Math.max(
          0,
          Math.min(0.18, currentVol.current * 0.18)
        );
      }
    }, 40);

    return () => {
      if (fadeTimer.current) clearInterval(fadeTimer.current);
      bedOscs.forEach((o) => o.stop());
      ctx.close().catch(() => {});
      ctxRef.current = null;
      bedGainRef.current = null;
    };
  }, [active]);

  const playMelodyNote = React.useCallback((velocity: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const note = MELODY[noteIndex.current % MELODY.length];
    noteIndex.current += 1;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const wobble = 1 + (Math.random() * 0.06 - 0.03);
    osc.type = note.type;
    osc.frequency.setValueAtTime(note.freq * wobble, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      note.freq * wobble * 0.98,
      ctx.currentTime + 0.12
    );

    const peak = Math.min(0.28, 0.06 + velocity * 0.05);
    gain.gain.setValueAtTime(peak, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.34);
  }, []);

  const playPerc = React.useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const freq = PERC_FREQS[Math.floor(Math.random() * PERC_FREQS.length)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }, []);

  React.useEffect(() => {
    if (!active || !editor) return;

    prevLen.current = editor.getText().length;

    const onUpdate = () => {
      const len = editor.getText().length;
      const delta = Math.max(0, len - prevLen.current);
      prevLen.current = len;

      if (delta > 0) {
        targetVol.current = Math.min(1, 0.4 + delta * 0.1);
        playMelodyNote(delta);
        if (delta >= 2 || Math.random() > 0.55) playPerc();
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
          targetVol.current = 0;
        }, 2400);
      }
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [active, editor, playMelodyNote, playPerc]);
}
