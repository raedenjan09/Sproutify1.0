import { DefaultTheme } from '@react-navigation/native';

const gardenTheme = {
  colors: {
    canvas: '#F4F0E6',
    canvasSoft: '#FBF8F1',
    surface: '#FFFDFC',
    surfaceMuted: '#EEF4EA',
    surfaceTint: '#E4EEDF',
    text: '#213424',
    textStrong: '#17311F',
    muted: '#647864',
    accent: '#4D7A43',
    accentStrong: '#2F5C34',
    accentSoft: '#DCEAD7',
    accentGlow: '#EFF6E9',
    leaf: '#86A96F',
    clay: '#BF7D4F',
    claySoft: '#F8E8D8',
    rose: '#D7665A',
    danger: '#C35E43',
    success: '#2F7D4B',
    border: '#DED6C8',
    borderStrong: '#CCBFAE',
    overlay: 'rgba(22, 41, 23, 0.48)',
    shadow: '#1A231B',
    white: '#FFFFFF',
  },
  radii: {
    sm: 12,
    md: 18,
    lg: 26,
    xl: 34,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  shadows: {
    soft: {
      shadowColor: '#1A231B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
      elevation: 4,
    },
    medium: {
      shadowColor: '#1A231B',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 22,
      elevation: 6,
    },
  },
};

export const gardenNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: gardenTheme.colors.accentStrong,
    background: gardenTheme.colors.canvas,
    card: gardenTheme.colors.surface,
    text: gardenTheme.colors.text,
    border: gardenTheme.colors.border,
    notification: gardenTheme.colors.rose,
  },
};

export default gardenTheme;
