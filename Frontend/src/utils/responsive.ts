import { Dimensions, Platform } from 'react-native';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device type detection
export const isTablet = screenWidth >= 768;
export const isDesktop = screenWidth >= 1024;
export const isMobile = screenWidth < 768;

// Platform detection
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Breakpoints
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

// Responsive width and height functions
export const wp = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

// Scale functions for responsive text and elements
export const scale = (size: number): number => {
  const baseWidth = 390; // iPhone 12 Pro width as base
  return (screenWidth / baseWidth) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Responsive font sizes
export const fontSize = {
  xs: moderateScale(12),
  sm: moderateScale(14),
  base: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  '2xl': moderateScale(24),
  '3xl': moderateScale(30),
  '4xl': moderateScale(36),
  '5xl': moderateScale(48),
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  '2xl': scale(48),
  '3xl': scale(64),
};

// Responsive border radius
export const borderRadius = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  '2xl': scale(24),
  full: 9999,
};

// Device-specific styles helper
export const deviceStyles = <T extends Record<string, any>>(styles: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T => {
  if (isDesktop && styles.desktop) return { ...styles.default, ...styles.desktop };
  if (isTablet && styles.tablet) return { ...styles.default, ...styles.tablet };
  if (isMobile && styles.mobile) return { ...styles.default, ...styles.mobile };
  return styles.default;
};

// Container width helper
export const getContainerWidth = (): number => {
  if (isDesktop) return Math.min(screenWidth * 0.8, 1200);
  if (isTablet) return screenWidth * 0.9;
  return screenWidth * 0.95;
};

// Grid columns helper
export const getColumns = (): number => {
  if (isDesktop) return 4;
  if (isTablet) return 2;
  return 1;
};

// Safe area helpers
export const getSafeAreaPadding = () => {
  return {
    paddingTop: isWeb ? spacing.lg : spacing.xl,
    paddingBottom: isWeb ? spacing.lg : spacing.xl,
    paddingHorizontal: spacing.md,
  };
};

// Responsive card dimensions
export const getCardDimensions = () => {
  const cardWidth = isDesktop 
    ? (getContainerWidth() - spacing.lg * 3) / 4 
    : isTablet 
    ? (screenWidth - spacing.lg * 3) / 2 
    : screenWidth - spacing.lg * 2;
    
  return {
    width: cardWidth,
    minHeight: isDesktop ? 200 : isTablet ? 180 : 160,
  };
};

// Responsive modal dimensions
export const getModalDimensions = () => {
  return {
    width: isDesktop 
      ? Math.min(600, screenWidth * 0.6) 
      : isTablet 
      ? screenWidth * 0.8 
      : screenWidth * 0.95,
    maxHeight: screenHeight * 0.8,
  };
};

// Navigation dimensions
export const getNavigationHeight = (): number => {
  if (isDesktop) return 70;
  if (isTablet) return 65;
  return 60;
};

// Bottom tab bar dimensions
export const getTabBarHeight = (): number => {
  if (isDesktop) return 0; // Hide on desktop
  if (isTablet) return 70;
  return 60;
};

// Responsive icon sizes
export const iconSizes = {
  xs: scale(12),
  sm: scale(16),
  md: scale(20),
  lg: scale(24),
  xl: scale(32),
  '2xl': scale(40),
  '3xl': scale(48),
};

// Responsive button dimensions
export const buttonSizes = {
  sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    fontSize: fontSize.sm,
  },
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.base,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.lg,
  },
};

// Update dimensions on orientation change
let dimensionsSubscription: any;

export const initializeResponsive = () => {
  dimensionsSubscription = Dimensions.addEventListener('change', ({ window }) => {
    // Update global dimensions if needed
    // This can be used to trigger re-renders in components
  });
};

export const cleanupResponsive = () => {
  if (dimensionsSubscription) {
    dimensionsSubscription.remove();
  }
};

// Export all utilities
export default {
  wp,
  hp,
  scale,
  moderateScale,
  fontSize,
  spacing,
  borderRadius,
  deviceStyles,
  getContainerWidth,
  getColumns,
  getSafeAreaPadding,
  getCardDimensions,
  getModalDimensions,
  getNavigationHeight,
  getTabBarHeight,
  iconSizes,
  buttonSizes,
  isTablet,
  isDesktop,
  isMobile,
  isWeb,
  isIOS,
  isAndroid,
  breakpoints,
  initializeResponsive,
  cleanupResponsive,
};
