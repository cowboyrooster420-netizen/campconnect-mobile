// Badge visual system — one place that keeps every merit patch on-theme.
//
// A patch is always the same medallion (rope ring + stitched edge + cream emblem
// + gold earned-star). Only three things ever change per badge:
//   1. tone   → the field color (mapped below)
//   2. icon   → an Ionicons name (the emblem)
//   3. name   → the label
// Adding a new badge is therefore one DB row — no new artwork required.

import { Ionicons } from "@expo/vector-icons";
import type { Badge, ChallengeCategory } from "@/lib/types";

export type BadgeTone =
  | "pine"
  | "sunset"
  | "purple"
  | "blue"
  | "teal"
  | "gold"
  | "berry";

// Field gradient as [top, bottom]. The rope ring + stitch are constant — see Badge.tsx.
export const BADGE_TONES: Record<BadgeTone, [string, string]> = {
  pine: ["#41A573", "#226A4B"],
  sunset: ["#EEA75D", "#CF7026"],
  purple: ["#A36FCB", "#774299"],
  blue: ["#5C95EA", "#2C61C2"],
  teal: ["#48A9B7", "#227E8C"],
  gold: ["#F0CE6C", "#CB9A33"],
  berry: ["#DA6457", "#B23529"],
};

// If you know the challenge category a badge belongs to, map it for an on-brand color.
export const CATEGORY_TONE: Record<ChallengeCategory, BadgeTone> = {
  outdoor: "pine",
  creative: "purple",
  reflection: "blue",
  tradition: "sunset",
};

// Hand-pick a tone for specific badges by name (optional — overrides the auto color).
export const TONE_OVERRIDES: Record<string, BadgeTone> = {
  "Camp Legend": "gold",
};

const TONE_CYCLE: BadgeTone[] = ["pine", "sunset", "purple", "blue", "teal", "berry"];

// Deterministic, stable tone from any string key — a given badge always looks the same.
export function toneFromKey(key: string): BadgeTone {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return TONE_CYCLE[h % TONE_CYCLE.length];
}

// Resolve a tone for a DB badge: explicit override first, deterministic fallback otherwise.
export function badgeTone(badge: Pick<Badge, "id" | "name">): BadgeTone {
  return TONE_OVERRIDES[badge.name] ?? toneFromKey(badge.id || badge.name);
}

// Badge icons may be valid Ionicons names or legacy SF Symbol names — normalize to Ionicons.
const SF_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  "figure.walk": "walk",
  "mountain.2.fill": "triangle",
  "flame.fill": "flame",
  "book.fill": "book",
  "crown.fill": "trophy",
  "star.fill": "star",
};

export function iconFor(name: string): keyof typeof Ionicons.glyphMap {
  if (name in Ionicons.glyphMap) return name as keyof typeof Ionicons.glyphMap;
  return SF_MAP[name] ?? "ribbon";
}
