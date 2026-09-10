import { TextStyle } from 'react-native';

// Brand palette — "Claro de Luna": forest greens, sage, earth and cream.
export const colors = {
  primary: '#2E4A2E',
  primaryLight: '#4A6B43',
  accent: '#8BA888',
  background: '#F5F1E8',
  surface: '#FFFFFF',
  text: '#2A2A2A',
  textMuted: '#6B6B6B',
  border: '#E0D9C8',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const typography: Record<'title' | 'subtitle' | 'body' | 'caption', TextStyle> = {
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 13 },
};

export const theme = { colors, spacing, typography };
