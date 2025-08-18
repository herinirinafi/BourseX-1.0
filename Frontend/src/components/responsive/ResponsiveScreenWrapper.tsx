import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../navigation/BottomTabBar';
import { 
  ResponsiveContainer, 
  ResponsiveScrollView 
} from '../responsive/ResponsiveLayouts';
import { spacing } from '../../utils/responsive';

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
}

export const ResponsiveScreenWrapper: React.FC<ResponsiveScreenWrapperProps> = ({
  children,
  showBottomTabs = true,
  backgroundColor = ['#0F172A', '#1E293B', '#374151'],
  scrollable = true,
  refreshControl,
  contentContainerStyle = {},
  style = {},
  maxWidth,
  padding = true,
}) => {
  const content = (
    <ResponsiveContainer 
      style={{ flex: 1, ...style }} 
      maxWidth={maxWidth}
      padding={padding}
    >
      {scrollable ? (
        <ResponsiveScrollView
          contentContainerStyle={{
            paddingBottom: showBottomTabs ? spacing.xl * 2 : spacing.lg,
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
      
      {showBottomTabs && <BottomTabBar />}
    </ResponsiveContainer>
  );

  return (
    <LinearGradient colors={backgroundColor} style={{ flex: 1 }}>
      {content}
    </LinearGradient>
  );
};

export default ResponsiveScreenWrapper;
