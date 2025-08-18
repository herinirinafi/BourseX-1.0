import { Dimensions, Platform, PixelRatio } from 'react-native';

// Device testing utilities for comprehensive mobile support
export interface DeviceTestResult {
  deviceName: string;
  category: 'small-mobile' | 'medium-mobile' | 'large-mobile' | 'tablet' | 'desktop';
  dimensions: {
    width: number;
    height: number;
    pixelDensity: number;
    fontScale: number;
  };
  recommendations: string[];
  touchTargetStatus: 'adequate' | 'marginal' | 'insufficient';
  layoutStatus: 'optimal' | 'good' | 'needs-adjustment';
}

// Popular device profiles for testing
export const deviceProfiles = {
  // iPhone devices
  iphoneSE1: { width: 320, height: 568, pixelRatio: 2, name: 'iPhone SE (1st gen)' },
  iphoneSE2: { width: 375, height: 667, pixelRatio: 2, name: 'iPhone SE (2nd/3rd gen)' },
  iphone12: { width: 390, height: 844, pixelRatio: 3, name: 'iPhone 12/13/14' },
  iphone12ProMax: { width: 428, height: 926, pixelRatio: 3, name: 'iPhone 12/13/14 Pro Max' },
  iphoneXR: { width: 414, height: 896, pixelRatio: 2, name: 'iPhone XR/11' },
  
  // Samsung devices
  galaxyS21: { width: 360, height: 800, pixelRatio: 3, name: 'Galaxy S21' },
  galaxyS21Ultra: { width: 384, height: 854, pixelRatio: 3.5, name: 'Galaxy S21 Ultra' },
  galaxyNote20: { width: 412, height: 915, pixelRatio: 2.625, name: 'Galaxy Note 20' },
  galaxyA52: { width: 360, height: 800, pixelRatio: 2.75, name: 'Galaxy A52' },
  galaxyFold: { width: 280, height: 653, pixelRatio: 3, name: 'Galaxy Fold (folded)' },
  galaxyFoldOpen: { width: 717, height: 512, pixelRatio: 3, name: 'Galaxy Fold (unfolded)' },
  
  // Google Pixel devices
  pixel4a: { width: 393, height: 851, pixelRatio: 2.75, name: 'Pixel 4a' },
  pixel6: { width: 393, height: 851, pixelRatio: 2.75, name: 'Pixel 6' },
  pixel6Pro: { width: 412, height: 915, pixelRatio: 3.5, name: 'Pixel 6 Pro' },
  
  // Other popular Android devices
  onePlus9: { width: 412, height: 915, pixelRatio: 3, name: 'OnePlus 9' },
  xiaomiRedmi: { width: 393, height: 873, pixelRatio: 2.75, name: 'Xiaomi Redmi Note' },
  huaweiP30: { width: 360, height: 780, pixelRatio: 3, name: 'Huawei P30' },
  
  // Tablets
  ipadMini: { width: 768, height: 1024, pixelRatio: 2, name: 'iPad Mini' },
  ipadAir: { width: 820, height: 1180, pixelRatio: 2, name: 'iPad Air' },
  ipadPro11: { width: 834, height: 1194, pixelRatio: 2, name: 'iPad Pro 11"' },
  ipadPro129: { width: 1024, height: 1366, pixelRatio: 2, name: 'iPad Pro 12.9"' },
  galaxyTabS7: { width: 753, height: 1037, pixelRatio: 2.4, name: 'Galaxy Tab S7' },
  
  // Desktop/Web common sizes
  laptop: { width: 1366, height: 768, pixelRatio: 1, name: 'Laptop (1366x768)' },
  desktop: { width: 1920, height: 1080, pixelRatio: 1, name: 'Desktop (1920x1080)' },
  ultrawide: { width: 2560, height: 1440, pixelRatio: 1, name: 'Ultrawide (2560x1440)' },
};

// Get current device information
export const getCurrentDeviceInfo = (): DeviceTestResult => {
  const { width, height } = Dimensions.get('window');
  const pixelDensity = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();
  
  const deviceInfo = {
    width,
    height,
    pixelDensity,
    fontScale,
  };
  
  // Categorize device
  let category: DeviceTestResult['category'] = 'medium-mobile';
  let deviceName = 'Unknown Device';
  
  if (width < 375) {
    category = 'small-mobile';
    deviceName = 'Small Mobile Device';
  } else if (width >= 375 && width < 414) {
    category = 'medium-mobile';
    deviceName = 'Medium Mobile Device';
  } else if (width >= 414 && width < 768) {
    category = 'large-mobile';
    deviceName = 'Large Mobile Device';
  } else if (width >= 768 && width < 1024) {
    category = 'tablet';
    deviceName = 'Tablet Device';
  } else {
    category = 'desktop';
    deviceName = 'Desktop/Web';
  }
  
  // Try to identify specific device
  for (const [, profile] of Object.entries(deviceProfiles)) {
    if (Math.abs(profile.width - width) <= 5 && Math.abs(profile.height - height) <= 20) {
      deviceName = profile.name;
      break;
    }
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  let touchTargetStatus: DeviceTestResult['touchTargetStatus'] = 'adequate';
  let layoutStatus: DeviceTestResult['layoutStatus'] = 'optimal';
  
  // Touch target recommendations
  if (width < 360) {
    recommendations.push('Use minimum 44px touch targets for small screens');
    touchTargetStatus = 'marginal';
  }
  
  if (pixelDensity > 3) {
    recommendations.push('High DPI device - ensure crisp graphics and appropriate scaling');
  }
  
  if (fontScale > 1.3) {
    recommendations.push('User has large font settings - test text layout carefully');
    layoutStatus = 'needs-adjustment';
  }
  
  // Layout recommendations by category
  switch (category) {
    case 'small-mobile':
      recommendations.push(
        'Prioritize single-column layouts',
        'Use smaller font sizes and compact spacing',
        'Ensure adequate touch targets (min 44px)',
        'Consider hiding non-essential UI elements'
      );
      break;
      
    case 'medium-mobile':
      recommendations.push(
        'Optimize for portrait orientation',
        'Use standard mobile UI patterns',
        'Ensure comfortable touch targets (44-48px)'
      );
      break;
      
    case 'large-mobile':
      recommendations.push(
        'Consider two-column layouts in landscape',
        'Use larger touch targets for comfort',
        'Optimize for one-handed usage'
      );
      break;
      
    case 'tablet':
      recommendations.push(
        'Use multi-column layouts effectively',
        'Increase padding and spacing',
        'Consider desktop-like interactions'
      );
      break;
      
    case 'desktop':
      recommendations.push(
        'Use full multi-column layouts',
        'Optimize for mouse interactions',
        'Consider keyboard navigation'
      );
      break;
  }
  
  return {
    deviceName,
    category,
    dimensions: deviceInfo,
    recommendations,
    touchTargetStatus,
    layoutStatus,
  };
};

// Test component across different device sizes
export const testResponsiveLayout = (componentName: string): DeviceTestResult[] => {
  const results: DeviceTestResult[] = [];
  
  // Test against key device profiles
  const keyDevices = [
    'iphoneSE1', 'iphone12', 'iphone12ProMax',
    'galaxyS21', 'galaxyNote20', 'pixel6',
    'ipadMini', 'ipadPro11', 'desktop'
  ];
  
  keyDevices.forEach(deviceKey => {
    const profile = deviceProfiles[deviceKey as keyof typeof deviceProfiles];
    if (!profile) return;
    
    // Simulate device dimensions
    const mockDimensions = {
      width: profile.width,
      height: profile.height,
      pixelDensity: profile.pixelRatio,
      fontScale: 1,
    };
    
    let category: DeviceTestResult['category'] = 'medium-mobile';
    if (profile.width < 375) category = 'small-mobile';
    else if (profile.width >= 414 && profile.width < 768) category = 'large-mobile';
    else if (profile.width >= 768 && profile.width < 1024) category = 'tablet';
    else if (profile.width >= 1024) category = 'desktop';
    
    const recommendations: string[] = [`Test ${componentName} on ${profile.name}`];
    
    results.push({
      deviceName: profile.name,
      category,
      dimensions: mockDimensions,
      recommendations,
      touchTargetStatus: 'adequate',
      layoutStatus: 'optimal',
    });
  });
  
  return results;
};

// Device-specific style testing
export const getDeviceSpecificStyles = () => {
  const deviceInfo = getCurrentDeviceInfo();
  
  return {
    // Minimum touch target size
    minTouchTarget: Platform.OS === 'ios' ? 44 : 48,
    
    // Recommended button height by device
    buttonHeight: deviceInfo.category === 'small-mobile' ? 40 : 
                 deviceInfo.category === 'medium-mobile' ? 44 : 48,
    
    // Recommended padding by device
    screenPadding: deviceInfo.category === 'small-mobile' ? 12 : 
                  deviceInfo.category === 'medium-mobile' ? 16 : 
                  deviceInfo.category === 'large-mobile' ? 20 : 24,
    
    // Recommended font scaling
    fontScale: deviceInfo.category === 'small-mobile' ? 0.9 : 
               deviceInfo.category === 'large-mobile' ? 1.1 : 1.0,
               
    // Grid columns recommendation
    maxColumns: deviceInfo.category === 'desktop' ? 4 :
                deviceInfo.category === 'tablet' ? 2 : 1,
  };
};

// Log device information for debugging
export const logDeviceInfo = () => {
  const deviceInfo = getCurrentDeviceInfo();
  console.log('🔍 Device Information:', {
    name: deviceInfo.deviceName,
    category: deviceInfo.category,
    dimensions: deviceInfo.dimensions,
    platform: Platform.OS,
    recommendations: deviceInfo.recommendations,
  });
  
  return deviceInfo;
};
