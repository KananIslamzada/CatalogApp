export type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  rating: string;
  overlay: string;
  skeleton: string;
  skeletonHighlight: string;
};

export const lightPalette: Palette = {
  background: '#F6F6F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EEEEF2',
  border: '#E2E2E8',
  textPrimary: '#121216',
  textSecondary: '#3E3E48',
  textMuted: '#6E6E7A',
  textInverse: '#FFFFFF',
  accent: '#6A4DF4',
  accentPressed: '#5638DE',
  accentSoft: '#ECE8FF',
  danger: '#D93A3F',
  dangerSoft: '#FDECEC',
  success: '#1F9D63',
  rating: '#E8A400',
  overlay: 'rgba(10, 10, 14, 0.45)',
  skeleton: '#E7E7EC',
  skeletonHighlight: '#F4F4F7',
};

export const darkPalette: Palette = {
  background: '#0E0E11',
  surface: '#18181D',
  surfaceMuted: '#222229',
  border: '#2C2C35',
  textPrimary: '#F4F4F6',
  textSecondary: '#C9C9D1',
  textMuted: '#9A9AA6',
  textInverse: '#FFFFFF',
  accent: '#9C86FF',
  accentPressed: '#8670F2',
  accentSoft: '#2A2440',
  danger: '#FF6B6F',
  dangerSoft: '#3A1E21',
  success: '#3DCB8A',
  rating: '#FFC23D',
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: '#1F1F26',
  skeletonHighlight: '#2A2A33',
};
