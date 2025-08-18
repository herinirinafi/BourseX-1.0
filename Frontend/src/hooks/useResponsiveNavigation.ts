import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { isSmallMobile, isMediumMobile, isTablet } from '../utils/responsive';

interface ResponsiveNavigationConfig {
  maxMainTabs: number;
  showLabels: boolean;
  compactMode: boolean;
  dropdownThreshold: number;
  iconSize: {
    active: number;
    inactive: number;
  };
  fontSize: {
    label: number;
    utility: number;
  };
}

export const useResponsiveNavigation = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [config, setConfig] = useState<ResponsiveNavigationConfig>({
    maxMainTabs: 2,
    showLabels: true,
    compactMode: false,
    dropdownThreshold: 5,
    iconSize: { active: 22, inactive: 20 },
    fontSize: { label: 10, utility: 8 }
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const updateConfig = () => {
      let newConfig: ResponsiveNavigationConfig;

      if (isSmallMobile) {
        // iPhone SE, small Android phones
        newConfig = {
          maxMainTabs: 2,
          showLabels: true,
          compactMode: true,
          dropdownThreshold: 4,
          iconSize: { active: 20, inactive: 18 },
          fontSize: { label: 9, utility: 7 }
        };
      } else if (isMediumMobile) {
        // iPhone 12/13/14, standard Android phones
        newConfig = {
          maxMainTabs: 2,
          showLabels: true,
          compactMode: false,
          dropdownThreshold: 5,
          iconSize: { active: 22, inactive: 20 },
          fontSize: { label: 10, utility: 8 }
        };
      } else if (isTablet) {
        // iPads, Android tablets
        newConfig = {
          maxMainTabs: 4,
          showLabels: true,
          compactMode: false,
          dropdownThreshold: 7,
          iconSize: { active: 26, inactive: 24 },
          fontSize: { label: 12, utility: 10 }
        };
      } else {
        // Desktop/large screens
        newConfig = {
          maxMainTabs: 6,
          showLabels: true,
          compactMode: false,
          dropdownThreshold: 10,
          iconSize: { active: 28, inactive: 26 },
          fontSize: { label: 14, utility: 12 }
        };
      }

      setConfig(newConfig);
    };

    updateConfig();
  }, [screenData]);

  const getNavigationLayout = () => {
    return {
      shouldUseDropdown: true, // Always use dropdown for better organization
      showUtilityTabs: true,
      maxVisibleTabs: config.maxMainTabs + 3, // Main tabs + 3 dropdown menus
      spacing: isSmallMobile ? 'tight' : isMediumMobile ? 'normal' : 'comfortable'
    };
  };

  const getTabDimensions = () => {
    const layout = getNavigationLayout();
    const totalTabs = layout.maxVisibleTabs + 2; // +2 for utility tabs
    const availableWidth = screenData.width - 32; // Account for padding
    const tabWidth = availableWidth / totalTabs;

    return {
      tabWidth: Math.max(tabWidth, 45), // Minimum 45px width
      iconSize: config.iconSize,
      fontSize: config.fontSize,
      showLabels: config.showLabels && tabWidth > 50
    };
  };

  const getDropdownPosition = (anchorX: number, anchorY: number, menuWidth: number, menuHeight: number) => {
    const { width: screenWidth } = screenData;
    const padding = 16;

    // Calculate optimal position
    let x = anchorX - menuWidth / 2;
    let y = anchorY - menuHeight - 60; // Position above tab bar

    // Adjust horizontal position if menu goes off screen
    if (x < padding) {
      x = padding;
    } else if (x + menuWidth > screenWidth - padding) {
      x = screenWidth - menuWidth - padding;
    }

    // Adjust vertical position if menu goes off screen
    if (y < 100) {
      y = anchorY + 60; // Position below tab bar instead
    }

    return { x, y };
  };

  return {
    config,
    screenData,
    getNavigationLayout,
    getTabDimensions,
    getDropdownPosition,
    isSmallScreen: isSmallMobile,
    isMediumScreen: isMediumMobile,
    isLargeScreen: isTablet
  };
};

export default useResponsiveNavigation;
