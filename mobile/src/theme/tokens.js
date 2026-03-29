import { Platform } from 'react-native';

export const THEME = {
  background: '#FBFDFF',
  backgroundSoft: '#F7FAFD',
  surface: '#FFFFFF',
  surfaceSoft: '#F3F7FB',
  surfaceMuted: '#E4EBF2',
  ink: '#0A1B35',
  inkSoft: '#32506F',
  muted: '#667A92',
  mutedSoft: '#92A3B7',
  brand: '#F17CC7',
  brandStrong: '#BB438E',
  brandSoft: '#FDEAF8',
  accent: '#2780C7',
  accentSoft: '#EEF6FC',
  good: '#21A76E',
  border: '#D9E1E9',
  borderStrong: '#C8D2DC',
  overlay: 'rgba(15, 28, 51, 0.14)',
  rewardsA: '#8DE5F5',
  rewardsB: '#2A72DA',
};

export const SOFT_CARD_SHADOW = {
  shadowColor: '#2D5A90',
  shadowOpacity: 0.11,
  shadowRadius: 28,
  shadowOffset: { width: 0, height: 16 },
  elevation: 8,
};

export const UI_FONT_FAMILY = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: 'System',
});

export const SURFACE_RAISED = 'rgba(255,255,255,0.99)';
export const SURFACE_PANEL = 'rgba(255,255,255,0.97)';
export const SURFACE_SOFT = 'rgba(248,250,253,0.96)';
export const SURFACE_TINT = 'rgba(242,246,250,0.98)';
export const BORDER_TINT = 'rgba(212,220,228,0.98)';
export const BORDER_LIGHT = 'rgba(225,231,238,0.96)';

function normalizeHexColor(value, fallback = '#C8A97E') {
  const raw = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return fallback;
}

function hexToRgb(value, fallback = '#C8A97E') {
  const hex = normalizeHexColor(value, fallback).replace('#', '');
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function rgba(value, alpha, fallback = '#C8A97E') {
  const { r, g, b } = hexToRgb(value, fallback);
  return `rgba(${r},${g},${b},${alpha})`;
}

function mixColors(colorA, colorB, ratio = 0.5) {
  const a = hexToRgb(colorA, colorA);
  const b = hexToRgb(colorB, colorB);
  const mix = (start, end) => Math.round(start + (end - start) * ratio);
  const toHex = (value) => value.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(mix(a.r, b.r))}${toHex(mix(a.g, b.g))}${toHex(mix(a.b, b.b))}`;
}

export function createMowgliTheme({
  mode = 'light',
  brandColor,
  accentColor,
} = {}) {
  const resolvedAccent = normalizeHexColor(accentColor || brandColor || '#C8A97E');
  const resolvedBrand = normalizeHexColor(brandColor || accentColor || '#8B6F55');
  const isLight = String(mode).toLowerCase() !== 'dark';

  if (isLight) {
    return {
      mode: 'light',
      accent: resolvedAccent,
      brand: resolvedBrand,
      accentSoft: mixColors(resolvedAccent, '#FFFFFF', 0.9),
      accentSurface: rgba(resolvedAccent, 0.1),
      accentSurfaceStrong: rgba(resolvedAccent, 0.16),
      accentBorder: rgba(resolvedAccent, 0.18),
      accentBorderStrong: rgba(resolvedAccent, 0.28),
      accentHalo: rgba(resolvedAccent, 0.14),
      accentText: mixColors(resolvedAccent, '#2D1D10', 0.28),
      page: mixColors(resolvedAccent, '#FFFFFF', 0.95),
      header: '#FCFAF7',
      shell: '#FFFFFF',
      shellAlt: mixColors(resolvedAccent, '#FFFFFF', 0.93),
      surface: '#FFFFFF',
      surfaceAlt: mixColors(resolvedAccent, '#FFFFFF', 0.9),
      input: mixColors(resolvedAccent, '#FFFFFF', 0.94),
      border: rgba(resolvedAccent, 0.16),
      borderStrong: rgba(resolvedAccent, 0.24),
      text: '#1E1813',
      textSoft: '#5E5449',
      textMuted: '#7E7367',
      textInverse: '#FFFFFF',
      chipBg: rgba(resolvedAccent, 0.1),
      chipText: mixColors(resolvedAccent, '#402B14', 0.32),
      heroGlow: rgba(resolvedAccent, 0.12),
      primaryButtonBg: mixColors(resolvedAccent, '#FFF8EF', 0.32),
      primaryButtonText: '#1A120C',
      secondaryButtonBg: '#FFFFFF',
      secondaryButtonText: '#1E1813',
      secondaryButtonBorder: rgba(resolvedAccent, 0.18),
      keyboardBar: '#FAF6F0',
      keyboardHandle: rgba(resolvedAccent, 0.26),
    };
  }

  return {
    mode: 'dark',
    accent: resolvedAccent,
    brand: resolvedBrand,
    accentSoft: mixColors(resolvedAccent, '#FFFFFF', 0.84),
    accentSurface: rgba(resolvedAccent, 0.1),
    accentSurfaceStrong: rgba(resolvedAccent, 0.16),
    accentBorder: rgba(resolvedAccent, 0.18),
    accentBorderStrong: rgba(resolvedAccent, 0.3),
    accentHalo: rgba(resolvedAccent, 0.16),
    accentText: mixColors(resolvedAccent, '#FFFFFF', 0.2),
    page: '#0B0B0D',
    header: '#0E0E10',
    shell: '#121214',
    shellAlt: '#151518',
    surface: '#151518',
    surfaceAlt: '#18181B',
    input: '#101013',
    border: rgba(resolvedAccent, 0.14),
    borderStrong: rgba(resolvedAccent, 0.24),
    text: '#F2ECE3',
    textSoft: '#A59A8E',
    textMuted: '#8F8579',
    textInverse: '#0A0A0C',
    chipBg: rgba(resolvedAccent, 0.08),
    chipText: mixColors(resolvedAccent, '#FFFFFF', 0.22),
    heroGlow: rgba(resolvedAccent, 0.1),
    primaryButtonBg: '#F2ECE3',
    primaryButtonText: '#0A0A0C',
    secondaryButtonBg: '#18181B',
    secondaryButtonText: '#F2ECE3',
    secondaryButtonBorder: rgba(resolvedAccent, 0.16),
    keyboardBar: '#141416',
    keyboardHandle: rgba(resolvedAccent, 0.26),
  };
}
