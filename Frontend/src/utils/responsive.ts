import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get screen dimensions with real-time updates
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced device detection for all mobile devices
export const getDeviceInfo = () => {
  const pixelDensity = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();
  
  return {
    width: screenWidth,
    height: screenHeight,
    pixelDensity,
    fontScale,
    isLandscape: screenWidth > screenHeight,
    isPortrait: screenHeight > screenWidth,
  };
};

// Comprehensive device type detection
export const isSmallMobile = screenWidth < 375; // iPhone SE, small Android
export const isMediumMobile = screenWidth >= 375 && screenWidth < 414; // iPhone 12/13/14
export const isLargeMobile = screenWidth >= 414 && screenWidth < 768; // iPhone Plus/Pro Max, large Android
export const isTablet = screenWidth >= 768 && screenWidth < 1024;
export const isDesktop = screenWidth >= 1024;
export const isMobile = screenWidth < 768;

// Enhanced Platform detection
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Specific device breakpoints for popular devices
export const deviceBreakpoints = {
  // iPhone devices
  iphoneSE: 320,     // iPhone SE (1st gen)
  iphoneSE2: 375,    // iPhone SE (2nd/3rd gen), iPhone 6/7/8
  iphone12: 390,     // iPhone 12/13/14 Pro
  iphone12ProMax: 428, // iPhone 12/13/14 Pro Max
  iphoneXR: 414,     // iPhone XR/11
  
  // Samsung devices
  galaxyS: 360,      // Galaxy S series (standard)
  galaxyNote: 384,   // Galaxy Note series
  galaxyFold: 280,   // Galaxy Fold (folded)
  galaxyFoldOpen: 717, // Galaxy Fold (unfolded)
  
  // Other popular Android devices
  pixelSmall: 411,   // Pixel 4a, 5
  pixelLarge: 393,   // Pixel 6/7
  onePlus: 412,      // OnePlus devices
  
  // Tablets
  ipadMini: 768,     // iPad Mini
  ipad: 820,         // iPad Air/Pro 11"
  ipadPro: 1024,     // iPad Pro 12.9"
  
  // Desktop/Web
  desktop: 1024,
  largeDesktop: 1440,
  ultraWide: 1920,
};

// Enhanced breakpoints
export const breakpoints = {
  xs: 0,             // Extra small devices
  sm: 320,           // Small mobile devices
  md: 375,           // Medium mobile devices
  lg: 414,           // Large mobile devices
  xl: 768,           // Tablets
  '2xl': 1024,       // Desktop
  '3xl': 1440,       // Large desktop
  '4xl': 1920,       // Ultra-wide
};

// Enhanced responsive width and height functions
export const wp = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

export const hp = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

// Dynamic scale functions based on device size
export const scale = (size: number): number => {
  let baseWidth = 390; // Default: iPhone 12 Pro
  
  // Adjust base width for different device categories
  if (isSmallMobile) baseWidth = 320;      // iPhone SE base
  else if (isMediumMobile) baseWidth = 375; // iPhone 12 base
  else if (isLargeMobile) baseWidth = 414;  // iPhone Plus base
  else if (isTablet) baseWidth = 768;       // iPad base
  
  return (screenWidth / baseWidth) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Enhanced responsive font sizes for all devices
export const fontSize = {
  xs: moderateScale(10),   // Very small text
  sm: moderateScale(12),   // Small text
  base: moderateScale(14), // Base text
  md: moderateScale(16),   // Medium text
  lg: moderateScale(18),   // Large text
  xl: moderateScale(20),   // Extra large text
  '2xl': moderateScale(24), // 2X large text
  '3xl': moderateScale(30), // 3X large text
  '4xl': moderateScale(36), // 4X large text
  '5xl': moderateScale(48), // 5X large text
};

// Enhanced responsive spacing for all devices
export const spacing = {
  xxs: scale(2),   // Extra extra small
  xs: scale(4),    // Extra small
  sm: scale(8),    // Small
  md: scale(12),   // Medium
  lg: scale(16),   // Large
  xl: scale(20),   // Extra large
  '2xl': scale(24), // 2X large
  '3xl': scale(32), // 3X large
  '4xl': scale(40), // 4X large
  '5xl': scale(48), // 5X large
  '6xl': scale(64), // 6X large
};

// Enhanced responsive border radius
export const borderRadius = {
  none: 0,
  xs: scale(2),
  sm: scale(4),
  md: scale(6),
  lg: scale(8),
  xl: scale(12),
  '2xl': scale(16),
  '3xl': scale(24),
  full: 9999,
};

// Device-specific dimensions helper
export const getResponsiveDimensions = () => {
  const deviceInfo = getDeviceInfo();
  
  return {
    // Safe area considerations for different devices
    safeAreaTop: isIOS ? (deviceInfo.height >= 812 ? 44 : 20) : 0,
    safeAreaBottom: isIOS ? (deviceInfo.height >= 812 ? 34 : 0) : 0,
    
    // Header heights for different devices
    headerHeight: isSmallMobile ? 50 : isMediumMobile ? 56 : 60,
    
    // Tab bar heights
    tabBarHeight: isSmallMobile ? 60 : isMediumMobile ? 65 : 70,
    
    // Button heights
    buttonHeight: isSmallMobile ? 40 : isMediumMobile ? 44 : 48,
    
    // Input heights
    inputHeight: isSmallMobile ? 40 : isMediumMobile ? 44 : 48,
    
    // Card padding
    cardPadding: isSmallMobile ? spacing.sm : isMediumMobile ? spacing.md : spacing.lg,
    
    // Screen padding
    screenPadding: isSmallMobile ? spacing.md : isMediumMobile ? spacing.lg : spacing.xl,
  };
};

// Enhanced device-specific styles helper
export const deviceStyles = <T extends Record<string, any>>(styles: {
  smallMobile?: T;
  mediumMobile?: T;
  largeMobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}): T => {
  if (isDesktop && styles.desktop) return { ...styles.default, ...styles.desktop };
  if (isTablet && styles.tablet) return { ...styles.default, ...styles.tablet };
  if (isLargeMobile && styles.largeMobile) return { ...styles.default, ...styles.largeMobile };
  if (isMediumMobile && styles.mediumMobile) return { ...styles.default, ...styles.mediumMobile };
  if (isSmallMobile && styles.smallMobile) return { ...styles.default, ...styles.smallMobile };
  return styles.default;
};

// Orientation helpers
export const isLandscape = screenWidth > screenHeight;
export const isPortrait = screenHeight > screenWidth;

// Orientation-aware dimensions
export const getOrientationDimensions = () => {
  return {
    shortDimension: Math.min(screenWidth, screenHeight),
    longDimension: Math.max(screenWidth, screenHeight),
    isLandscape,
    isPortrait,
  };
};

// Touch target helpers for mobile devices
export const getTouchTargetSize = () => {
  // Minimum touch target: 44px (iOS) / 48dp (Android)
  const minTouchTarget = Platform.OS === 'ios' ? 44 : 48;
  
  return {
    minTouchTarget,
    button: isSmallMobile ? 40 : minTouchTarget,
    icon: isSmallMobile ? 24 : 28,
    tabIcon: isSmallMobile ? 20 : 24,
  };
};

// Device-specific layout helpers
export const getLayoutConfig = () => {
  const touchTargets = getTouchTargetSize();
  const dimensions = getResponsiveDimensions();
  
  return {
    // Container configs
    maxWidth: isDesktop ? 1200 : '100%',
    padding: dimensions.screenPadding,
    
    // Grid configs
    columns: isDesktop ? 4 : isTablet ? 2 : 1,
    gap: isSmallMobile ? spacing.sm : spacing.md,
    
    // Component sizes
    headerHeight: dimensions.headerHeight,
    buttonHeight: touchTargets.button,
    inputHeight: dimensions.inputHeight,
    
    // Typography scales
    headingScale: isSmallMobile ? 0.8 : isMediumMobile ? 0.9 : 1,
    bodyScale: isSmallMobile ? 0.85 : isMediumMobile ? 0.92 : 1,
  };
};

// Container width helper with device-specific logic
export const getContainerWidth = (): number => {
  if (isDesktop) return Math.min(screenWidth * 0.8, 1200);
  if (isTablet) return screenWidth * 0.9;
  if (isLargeMobile) return screenWidth * 0.95;
  if (isMediumMobile) return screenWidth * 0.92;
  return screenWidth * 0.90; // Small mobile
};

// Enhanced grid columns helper
export const getColumns = (maxColumns: number = 4): number => {
  if (isDesktop) return Math.min(maxColumns, 4);
  if (isTablet) return Math.min(maxColumns, 2);
  if (isLargeMobile && isLandscape) return Math.min(maxColumns, 2);
  return 1; // Mobile portrait
};

// Enhanced safe area helpers
export const getSafeAreaPadding = () => {
  const dimensions = getResponsiveDimensions();
  
  return {
    paddingTop: dimensions.safeAreaTop + (isWeb ? spacing.lg : spacing.md),
    paddingBottom: dimensions.safeAreaBottom + (isWeb ? spacing.lg : spacing.md),
    paddingHorizontal: dimensions.screenPadding,
  };
};

// Enhanced responsive card dimensions
export const getCardDimensions = () => {
  const containerWidth = getContainerWidth();
  const columns = getColumns();
  const gap = isSmallMobile ? spacing.sm : spacing.md;
  
  const cardWidth = isDesktop 
    ? (containerWidth - gap * (columns - 1)) / columns
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
