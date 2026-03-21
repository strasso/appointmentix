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
