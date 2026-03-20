import { Platform } from 'react-native';

export const THEME = {
  background: '#FFFFFF',
  backgroundSoft: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#F1FAFF',
  surfaceMuted: '#DDEFFC',
  ink: '#0E2146',
  inkSoft: '#2D4E77',
  muted: '#5B789A',
  mutedSoft: '#89A8C8',
  brand: '#F18BCF',
  brandStrong: '#D152AE',
  brandSoft: '#FDEAF8',
  accent: '#47C4EA',
  accentSoft: '#E3FAFF',
  good: '#28B97D',
  border: '#CEE0F0',
  borderStrong: '#BBD6EA',
  overlay: 'rgba(27, 49, 83, 0.26)',
  rewardsA: '#84E3F5',
  rewardsB: '#377EE0',
};

export const SOFT_CARD_SHADOW = {
  shadowColor: '#275189',
  shadowOpacity: 0.12,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 14 },
  elevation: 7,
};

export const UI_FONT_FAMILY = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: 'System',
});

export const SURFACE_RAISED = 'rgba(255,255,255,0.98)';
export const SURFACE_PANEL = 'rgba(255,255,255,0.94)';
export const SURFACE_SOFT = 'rgba(255,255,255,0.90)';
export const SURFACE_TINT = 'rgba(247,252,255,0.95)';
export const BORDER_TINT = 'rgba(208,225,240,0.98)';
export const BORDER_LIGHT = 'rgba(223,233,244,0.98)';
