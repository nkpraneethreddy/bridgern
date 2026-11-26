import { TextStyle } from 'react-native';

export const typography: Record<
  'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption' | 'label',
  TextStyle
> = {
  display: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  h3: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;
