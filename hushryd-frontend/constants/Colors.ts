import { Platform } from 'react-native';

// Currency symbol for Indian Rupee
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

// HushRyd website-inspired palette
const hushRydLight = {
  text: '#111827', // Dark gray for main text
  background: '#FFFFFF',
  tint: '#2563EB', // Modern blue
  tabIconDefault: '#9CA3AF',
  tabIconSelected: '#2563EB',
  primary: '#2563EB', // Modern blue (matches website)
  secondary: '#10B981', // Green for success/verified
  accent: '#F59E0B', // Amber/orange
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  card: '#FFFFFF',
  cardBackground: '#F9FAFB',
  textSecondary: '#6B7280', // Medium gray
  textTertiary: '#9CA3AF', // Light gray
  lightGray: '#F9FAFB',
  mediumGray: '#E5E7EB',
  darkGray: '#6B7280',
  gradientStart: '#2563EB', // Blue gradient start
  gradientEnd: '#1D4ED8', // Darker blue gradient end
  heroBackground: '#1E40AF', // Deep blue for hero
  statsBackground: '#EFF6FF', // Light blue for stats
};

const hushRydDark = {
  text: '#1DA1F2',
  background: '#121212',
  tint: '#1DA1F2',
  tabIconDefault: '#6C7680',
  tabIconSelected: '#1DA1F2',
  primary: '#1DA1F2',
  secondary: '#228B22',
  accent: '#FF8C00',
  success: '#32CD32',
  warning: '#FFC107',
  error: '#E63946',
  border: '#2E3135',
  card: '#1E1E1E',
  cardBackground: '#181818',
  textSecondary: '#1DA1F2',
  textTertiary: '#1DA1F2',
  lightGray: '#2E3135',
  mediumGray: '#3A3F47',
  darkGray: '#9CA7B0',
  gradientStart: '#32CD32',
  gradientEnd: '#228B22',
};

// Rapido-inspired palette for native mobile
const hushRydNativeLight = {
  ...hushRydLight,
  cardBackground: '#E6F4EA',
  tint: '#1DA1F2',
  tabIconDefault: hushRydLight.tabIconDefault,
  tabIconSelected: hushRydLight.tabIconSelected,
};

const hushRydNativeDark = {
  ...hushRydDark,
  cardBackground: '#1D2B1F',
};

const platformPalette =
  Platform.OS === 'web'
    ? { light: hushRydLight, dark: hushRydDark }
    : { light: hushRydNativeLight, dark: hushRydNativeDark };

export default platformPalette;
