import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isClient() {
  return typeof window !== 'undefined';
}

/**
 * Darkens an RGB color by a specified percentage
 * @param rgbColor - RGB color string in format 'rgb(r, g, b)' or 'rgba(r, g, b, a)'
 * @param percentage - Percentage to darken by (0-100)
 * @returns Darkened RGB color string
 */
export const darkenRgbColor = (
  rgbColor: string,
  percentage: number
): string => {
  // Early return if percentage is invalid
  if (percentage < 0 || percentage > 100) {
    return rgbColor;
  }

  // Parse RGB values from the string
  const rgbMatch = rgbColor.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );

  if (!rgbMatch || rgbMatch.length < 4) {
    return rgbColor;
  }

  // Extract RGB values with proper type checking
  const r = parseInt(rgbMatch[1] || '0', 10);
  const g = parseInt(rgbMatch[2] || '0', 10);
  const b = parseInt(rgbMatch[3] || '0', 10);
  const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined;

  // Calculate darkening factor (0-1)
  const darkenFactor = percentage / 100;

  // Darken each color component
  const darkenedR = Math.max(0, Math.floor(r * (1 - darkenFactor)));
  const darkenedG = Math.max(0, Math.floor(g * (1 - darkenFactor)));
  const darkenedB = Math.max(0, Math.floor(b * (1 - darkenFactor)));

  // Return the darkened color
  return a !== undefined
    ? `rgba(${darkenedR}, ${darkenedG}, ${darkenedB}, ${a})`
    : `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
};
