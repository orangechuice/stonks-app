import { ColorShade } from '../types/stock';

/**
 * Computes sharp, visually distinct dynamic shades of green or red based on stock percentage change.
 * 
 * Distinct Magnitude Bands:
 * 1. Flat / Micro (< 0.20%): Muted subtle dark tint with soft text.
 * 2. Mild (0.20% - 0.80%): Soft medium tone (brick red / sage green).
 * 3. Moderate (0.80% - 2.50%): Standard vibrant crimson / emerald with crisp white text.
 * 4. Heavy (2.50% - 5.00%): Deep rich dark red / dark green.
 * 5. Extreme (> 5.00%): Intense dark blood red / dark neon emerald with glowing highlight.
 */
export function getColorShade(percentChange: number): ColorShade {
  const isPositive = percentChange >= 0;
  const absVal = Math.abs(percentChange);

  // Flat / Negligible change (< 0.05%)
  if (absVal < 0.05) {
    return {
      bgColor: 'rgba(45, 45, 50, 0.75)',
      textColor: '#A1A1A6',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      strokeColor: '#7C7C80',
      fillGradientStart: 'rgba(124, 124, 128, 0.25)',
      fillGradientEnd: 'rgba(124, 124, 128, 0.0)',
      glowColor: 'transparent',
      intensity: 0,
      isPositive: true,
    };
  }

  if (isPositive) {
    // GREEN GRADIENT SHADES
    if (absVal < 0.35) {
      // 0.05% - 0.35%: Pale subtle sage green
      return {
        bgColor: 'rgba(24, 58, 36, 0.75)',
        textColor: '#6EE7B7',
        borderColor: 'rgba(52, 211, 153, 0.3)',
        strokeColor: '#34D399',
        fillGradientStart: 'rgba(52, 211, 153, 0.25)',
        fillGradientEnd: 'rgba(52, 211, 153, 0.0)',
        glowColor: 'transparent',
        intensity: 0.2,
        isPositive: true,
      };
    } else if (absVal < 1.20) {
      // 0.35% - 1.20%: Soft medium emerald green
      return {
        bgColor: 'rgba(16, 98, 52, 0.85)',
        textColor: '#A7F3D0',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        strokeColor: '#10B981',
        fillGradientStart: 'rgba(16, 185, 129, 0.3)',
        fillGradientEnd: 'rgba(16, 185, 129, 0.0)',
        glowColor: 'rgba(16, 185, 129, 0.2)',
        intensity: 0.45,
        isPositive: true,
      };
    } else if (absVal < 3.00) {
      // 1.20% - 3.00%: Vivid standard bright green
      return {
        bgColor: 'rgba(5, 140, 66, 0.95)',
        textColor: '#FFFFFF',
        borderColor: 'rgba(48, 209, 88, 0.7)',
        strokeColor: '#30D158',
        fillGradientStart: 'rgba(48, 209, 88, 0.35)',
        fillGradientEnd: 'rgba(48, 209, 88, 0.0)',
        glowColor: 'rgba(48, 209, 88, 0.35)',
        intensity: 0.75,
        isPositive: true,
      };
    } else if (absVal < 5.00) {
      // 3.00% - 5.00%: Deep rich dark green
      return {
        bgColor: 'rgb(8, 105, 45)',
        textColor: '#FFFFFF',
        borderColor: 'rgb(12, 160, 68)',
        strokeColor: '#0CA044',
        fillGradientStart: 'rgba(12, 160, 68, 0.4)',
        fillGradientEnd: 'rgba(12, 160, 68, 0.0)',
        glowColor: 'rgba(12, 160, 68, 0.45)',
        intensity: 0.9,
        isPositive: true,
      };
    } else {
      // > 5.00%: Intense deep dark emerald green with bright glow
      return {
        bgColor: 'rgb(3, 75, 30)',
        textColor: '#FFFFFF',
        borderColor: 'rgb(0, 230, 90)',
        strokeColor: '#00E65A',
        fillGradientStart: 'rgba(0, 230, 90, 0.45)',
        fillGradientEnd: 'rgba(0, 230, 90, 0.0)',
        glowColor: 'rgba(0, 230, 90, 0.6)',
        intensity: 1.0,
        isPositive: true,
      };
    }
  } else {
    // RED GRADIENT SHADES
    if (absVal < 0.35) {
      // 0.05% - 0.35%: Pale subtle dark rose
      return {
        bgColor: 'rgba(65, 25, 28, 0.75)',
        textColor: '#FCA5A5',
        borderColor: 'rgba(248, 113, 113, 0.3)',
        strokeColor: '#F87171',
        fillGradientStart: 'rgba(248, 113, 113, 0.25)',
        fillGradientEnd: 'rgba(248, 113, 113, 0.0)',
        glowColor: 'transparent',
        intensity: 0.2,
        isPositive: false,
      };
    } else if (absVal < 1.20) {
      // 0.35% - 1.20%: Soft dull brick red
      return {
        bgColor: 'rgba(115, 30, 36, 0.85)',
        textColor: '#FECACA',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        strokeColor: '#EF4444',
        fillGradientStart: 'rgba(239, 68, 68, 0.3)',
        fillGradientEnd: 'rgba(239, 68, 68, 0.0)',
        glowColor: 'rgba(239, 68, 68, 0.2)',
        intensity: 0.45,
        isPositive: false,
      };
    } else if (absVal < 3.00) {
      // 1.20% - 3.00%: Vivid standard bright crimson
      return {
        bgColor: 'rgba(175, 25, 35, 0.95)',
        textColor: '#FFFFFF',
        borderColor: 'rgba(255, 69, 58, 0.7)',
        strokeColor: '#FF453A',
        fillGradientStart: 'rgba(255, 69, 58, 0.35)',
        fillGradientEnd: 'rgba(255, 69, 58, 0.0)',
        glowColor: 'rgba(255, 69, 58, 0.35)',
        intensity: 0.75,
        isPositive: false,
      };
    } else if (absVal < 5.00) {
      // 3.00% - 5.00%: Deep rich dark crimson
      return {
        bgColor: 'rgb(125, 12, 22)',
        textColor: '#FFFFFF',
        borderColor: 'rgb(200, 20, 35)',
        strokeColor: '#C81423',
        fillGradientStart: 'rgba(200, 20, 35, 0.4)',
        fillGradientEnd: 'rgba(200, 20, 35, 0.0)',
        glowColor: 'rgba(200, 20, 35, 0.45)',
        intensity: 0.9,
        isPositive: false,
      };
    } else {
      // > 5.00%: Extreme deep dark blood red with intense crimson glow
      return {
        bgColor: 'rgb(80, 4, 12)',
        textColor: '#FFFFFF',
        borderColor: 'rgb(255, 30, 50)',
        strokeColor: '#FF1E32',
        fillGradientStart: 'rgba(255, 30, 50, 0.5)',
        fillGradientEnd: 'rgba(255, 30, 50, 0.0)',
        glowColor: 'rgba(255, 30, 50, 0.65)',
        intensity: 1.0,
        isPositive: false,
      };
    }
  }
}

/**
 * Format currency numbers safely (e.g., $325.89 or $7,498.96)
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format compact numbers for Market Cap / Volume (e.g. 2.989B, 15.4M)
 */
export function formatCompactNumber(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value) || value === 0) return '-';
  if (value >= 1e12) return (value / 1e12).toFixed(3) + 'T';
  if (value >= 1e9) return (value / 1e9).toFixed(3) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toLocaleString('en-US');
}
