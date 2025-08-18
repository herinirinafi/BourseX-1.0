import React from 'react';
import { ViewStyle, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SmartNavigationBar } from '../navigation';
import { 
  ResponsiveContainer, 
  ResponsiveScrollView 
} from '../responsive/ResponsiveLayouts';
import { 
  spacing, 
  getResponsiveDimensions, 
  getSafeAreaPadding,
  isSmallMobile,
  isMediumMobile,
  isLargeMobile,
  isTablet,
  isIOS
} from '../../utils/responsive';

interface ResponsiveScreenWrapperProps {
  children: React.ReactNode;
  showBottomTabs?: boolean;
  backgroundColor?: [string, string, ...string[]];
  scrollable?: boolean;
  refreshControl?: React.ReactElement;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  maxWidth?: number;
  padding?: boolean;
  statusBarStyle?: 'auto' | 'inverted' | 'dark' | 'light';
  safeAreaHandling?: 'auto' | 'manual' | 'none';
}

export const ResponsiveScreenWrapper: React.FC<ResponsiveScreenWrapperProps> = ({
  children,
  showBottomTabs = true,
  backgroundColor = ['#FAFBFC', '#F8FAFC', '#F1F5F9'],
  scrollable = true,
  refreshControl,
  contentContainerStyle = {},
  style = {},
  maxWidth,
  padding = true,
  statusBarStyle = 'dark',
  safeAreaHandling = 'auto',
}) => {
  const dimensions = getResponsiveDimensions();
  const safeAreaPadding = getSafeAreaPadding();
  
  // Device-specific configurations
  const getDeviceConfig = () => {
    if (isSmallMobile) {
      return {
        bottomTabOffset: dimensions.tabBarHeight + dimensions.safeAreaBottom,
        contentPadding: spacing.sm,
        scrollOffset: spacing.md,
      };
    } else if (isMediumMobile) {
      return {
        bottomTabOffset: dimensions.tabBarHeight + dimensions.safeAreaBottom,
        contentPadding: spacing.md,
        scrollOffset: spacing.lg,
      };
    } else if (isLargeMobile) {
      return {
        bottomTabOffset: dimensions.tabBarHeight + dimensions.safeAreaBottom,
        contentPadding: spacing.lg,
        scrollOffset: spacing.xl,
      };
    } else if (isTablet) {
      return {
        bottomTabOffset: dimensions.tabBarHeight + dimensions.safeAreaBottom,
        contentPadding: spacing.xl,
        scrollOffset: spacing['2xl'],
      };
    } else {
      return {
        bottomTabOffset: dimensions.tabBarHeight,
        contentPadding: spacing['2xl'],
        scrollOffset: spacing['2xl'],
      };
    }
  };
  
  const deviceConfig = getDeviceConfig();
  
  // Handle safe area based on device and configuration
  const getSafeAreaStyle = () => {
    if (safeAreaHandling === 'none') return {};
    
    if (safeAreaHandling === 'auto') {
      return {
        paddingTop: isIOS ? dimensions.safeAreaTop : (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
      };
    }
    
    return safeAreaPadding;
  };

  const content = (
    <ResponsiveContainer 
      style={{ 
        flex: 1, 
        ...getSafeAreaStyle(),
        ...style 
      }} 
      maxWidth={maxWidth}
      padding={padding}
    >
      {scrollable ? (
        <ResponsiveScrollView
          contentContainerStyle={{
            paddingBottom: showBottomTabs ? deviceConfig.bottomTabOffset : deviceConfig.scrollOffset,
            paddingHorizontal: padding ? deviceConfig.contentPadding : 0,
            ...contentContainerStyle,
          }}
          {...(refreshControl && { refreshControl })}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ResponsiveScrollView>
      ) : (
        children
      )}
      
      {showBottomTabs && <SmartNavigationBar />}
    </ResponsiveContainer>
  );

  return (
    <LinearGradient colors={backgroundColor} style={{ flex: 1 }}>
      {Platform.OS !== 'web' && (
        <StatusBar 
          barStyle={statusBarStyle === 'auto' ? 'dark-content' : statusBarStyle === 'light' ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundColor[0]}
          translucent={isIOS}
        />
      )}
      {content}
    </LinearGradient>
  );
};

export default ResponsiveScreenWrapper;
