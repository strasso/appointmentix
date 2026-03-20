import { Platform } from 'react-native';

export const THEME = {
  background: '#FBFDFF',
  backgroundSoft: '#F8FBFE',
  surface: '#FFFFFF',
  surfaceSoft: '#F4FAFF',
  surfaceMuted: '#DDEAF5',
  ink: '#0A1B35',
  inkSoft: '#32506F',
  muted: '#617D99',
  mutedSoft: '#8DA8C2',
  brand: '#F17CC7',
  brandStrong: '#BB438E',
  brandSoft: '#FDEAF8',
  accent: '#1497E8',
  accentSoft: '#EAF8FF',
  good: '#21A76E',
  border: '#D6E4EE',
  borderStrong: '#C2D7E6',
  overlay: 'rgba(15, 28, 51, 0.24)',
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
export const SURFACE_SOFT = 'rgba(250,252,255,0.94)';
export const SURFACE_TINT = 'rgba(244,249,255,0.98)';
export const BORDER_TINT = 'rgba(206,223,236,0.98)';
export const BORDER_LIGHT = 'rgba(220,232,242,0.96)';
