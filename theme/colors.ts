export const colors = {
  // Brand Colors
  primary: '#3B82F6', // Blue
  secondary: '#10B981', // Green
  accent: '#F59E0B', // Amber
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Neutral Colors
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic Colors
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
    disabled: '#9CA3AF',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    tertiary: '#E5E7EB',
    inverse: '#1F2937',
  },
  
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // Dark Mode Colors (if needed later)
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
  },
  
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: '#3B82F6',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#3B82F6',
  },
};

// Helper function to get colors with opacity
export const withOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};