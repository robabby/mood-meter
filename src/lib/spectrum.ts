/**
 * Energy spectrum color mapping
 *
 * Maps energy values (0-1) to HSL colors on the mood spectrum.
 * The spectrum flows from depleted (cool blues) to elevated (warm oranges).
 */

import type { HSLColor, EnergyLevel } from "@/types";

/** Energy level boundaries */
const ENERGY_THRESHOLDS = {
  depleted: { min: 0, max: 0.2 },
  low: { min: 0.2, max: 0.4 },
  balanced: { min: 0.4, max: 0.6 },
  elevated: { min: 0.6, max: 0.8 },
  high: { min: 0.8, max: 1.0 },
} as const;

/** Hue ranges for each energy level */
const HUE_RANGES = {
  depleted: { min: 220, max: 250 }, // Deep blues
  low: { min: 180, max: 220 }, // Teals to blues
  balanced: { min: 140, max: 180 }, // Greens
  elevated: { min: 40, max: 70 }, // Yellows
  high: { min: 10, max: 40 }, // Oranges to corals
} as const;

/** Convert energy value (0-1) to energy level */
export function energyToLevel(energy: number): EnergyLevel {
  if (energy < 0.2) return "depleted";
  if (energy < 0.4) return "low";
  if (energy < 0.6) return "balanced";
  if (energy < 0.8) return "elevated";
  return "high";
}

/** Convert energy value (0-1) to HSL color */
export function energyToColor(energy: number): HSLColor {
  // Clamp energy to valid range
  const e = Math.max(0, Math.min(1, energy));

  // Map energy to hue (non-linear for better visual distribution)
  // Low energy → high hue (blues ~220-250)
  // High energy → low hue (oranges ~10-40)
  let hue: number;

  if (e < 0.2) {
    // Depleted: 220-250
    hue = 250 - (e / 0.2) * 30;
  } else if (e < 0.4) {
    // Low: 180-220
    hue = 220 - ((e - 0.2) / 0.2) * 40;
  } else if (e < 0.6) {
    // Balanced: 140-180
    hue = 180 - ((e - 0.4) / 0.2) * 40;
  } else if (e < 0.8) {
    // Elevated: 40-140 (big jump through greens to yellows)
    hue = 140 - ((e - 0.6) / 0.2) * 100;
  } else {
    // High: 10-40
    hue = 40 - ((e - 0.8) / 0.2) * 30;
  }

  // Saturation peaks in the middle, lower at extremes
  const saturation = 45 + Math.sin(e * Math.PI) * 25;

  // Lightness is fairly consistent, slightly brighter at high energy
  const lightness = 50 + e * 10;

  return {
    h: Math.round(hue),
    s: Math.round(saturation),
    l: Math.round(lightness),
  };
}

/** Convert HSL to CSS string */
export function hslToString(color: HSLColor): string {
  return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
}

/** Convert HSL to hex string */
export function hslToHex(color: HSLColor): string {
  const { h, s, l } = color;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Generate alternative colors near a given energy level */
export function generateAlternatives(
  energy: number,
  count: number = 5
): HSLColor[] {
  const step = 0.05;
  const alternatives: HSLColor[] = [];

  // Generate colors around the energy value
  for (let i = 0; i < count; i++) {
    const offset = (i - Math.floor(count / 2)) * step;
    const altEnergy = Math.max(0, Math.min(1, energy + offset));
    alternatives.push(energyToColor(altEnergy));
  }

  return alternatives;
}

/** Average multiple HSL colors (for calendar day with multiple entries) */
export function averageColors(colors: HSLColor[]): HSLColor {
  if (colors.length === 0) {
    return { h: 160, s: 50, l: 50 }; // Default balanced color
  }

  if (colors.length === 1) {
    return colors[0];
  }

  // Average hue requires circular mean
  let sinSum = 0;
  let cosSum = 0;
  let sSum = 0;
  let lSum = 0;

  for (const color of colors) {
    const hRad = (color.h * Math.PI) / 180;
    sinSum += Math.sin(hRad);
    cosSum += Math.cos(hRad);
    sSum += color.s;
    lSum += color.l;
  }

  const avgHRad = Math.atan2(sinSum, cosSum);
  let avgH = (avgHRad * 180) / Math.PI;
  if (avgH < 0) avgH += 360;

  return {
    h: Math.round(avgH),
    s: Math.round(sSum / colors.length),
    l: Math.round(lSum / colors.length),
  };
}

/** Generate CSS gradient for the full spectrum */
export function getSpectrumGradient(): string {
  const stops = Array.from({ length: 11 }, (_, i) => {
    const energy = i / 10;
    const color = energyToColor(energy);
    return `${hslToString(color)} ${energy * 100}%`;
  });

  return `linear-gradient(to right, ${stops.join(", ")})`;
}
