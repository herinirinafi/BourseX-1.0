import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { 
  getContainerWidth, 
  getSafeAreaPadding, 
  spacing, 
  isDesktop, 
  isTablet 
} from '../../utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
  padding?: boolean;
  centered?: boolean;
  fullWidth?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style = {},
  maxWidth,
  padding = true,
  centered = true,
  fullWidth = false,
}) => {
  const baseStyle: ViewStyle = {
    width: fullWidth ? '100%' : getContainerWidth(),
    alignSelf: centered ? 'center' : 'flex-start',
    ...(padding && getSafeAreaPadding()),
    ...style,
  };

  const containerStyle: ViewStyle = isDesktop 
    ? {
        ...baseStyle,
        maxWidth: maxWidth || 1200,
        paddingHorizontal: spacing.xl,
      }
    : isTablet
    ? {
        ...baseStyle,
        paddingHorizontal: spacing.lg,
      }
    : {
        ...baseStyle,
        paddingHorizontal: spacing.md,
      };

  return <View style={containerStyle}>{children}</View>;
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  gap = spacing.md,
  style = {},
}) => {
  const gridColumns = columns || (isDesktop ? 4 : isTablet ? 2 : 1);
  
  const gridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -gap / 2,
    ...style,
  };

  const getChildStyle = (): ViewStyle => ({
    width: `${100 / gridColumns}%` as any,
    paddingHorizontal: gap / 2,
    marginBottom: gap,
  });

  return (
    <View style={gridStyle}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={getChildStyle()}>
          {child}
        </View>
      ))}
    </View>
  );
};

interface ResponsiveRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  wrap?: boolean;
  gap?: number;
}

export const ResponsiveRow: React.FC<ResponsiveRowProps> = ({
  children,
  style = {},
  justifyContent = 'flex-start',
  alignItems = 'center',
  wrap = false,
  gap = spacing.sm,
}) => {
  const baseRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent,
    alignItems,
    ...(wrap && { flexWrap: 'wrap' }),
    ...style,
  };

  const rowStyle: ViewStyle = !isDesktop && !isTablet && wrap
    ? {
        ...baseRowStyle,
        flexDirection: 'column',
        alignItems: 'stretch',
      }
    : baseRowStyle;

  return (
    <View style={rowStyle}>
      {React.Children.map(children, (child, index) => (
        <View 
          key={index} 
          style={{ 
            marginRight: index < React.Children.count(children) - 1 ? gap : 0,
            ...(wrap && { marginBottom: gap }),
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

interface ResponsiveScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

export const ResponsiveScrollView: React.FC<ResponsiveScrollViewProps> = ({
  children,
  style = {},
  contentContainerStyle = {},
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
}) => {
  const scrollViewStyle: ViewStyle = {
    flex: 1,
    ...style,
  };

  const contentStyle = {
    ...getSafeAreaPadding(),
    ...contentContainerStyle,
  };

  return (
    <ScrollView
      style={scrollViewStyle}
      contentContainerStyle={contentStyle}
      horizontal={horizontal}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
    >
      {children}
    </ScrollView>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  shadow?: boolean;
  borderRadius?: number;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  style = {},
  padding = true,
  shadow = true,
  borderRadius,
}) => {
  const baseCardStyle: ViewStyle = {
    backgroundColor: '#FFFFFF',
    ...(borderRadius && { borderRadius }),
    ...(shadow && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    ...style,
  };

  const cardStyle: ViewStyle = isDesktop
    ? {
        ...baseCardStyle,
        ...(padding && { padding: spacing.lg }),
        ...(shadow && {
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 5,
        }),
      }
    : isTablet
    ? {
        ...baseCardStyle,
        ...(padding && { padding: spacing.md }),
      }
    : {
        ...baseCardStyle,
        ...(padding && { padding: spacing.sm }),
      };

  return <View style={cardStyle}>{children}</View>;
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveRow,
  ResponsiveScrollView,
  ResponsiveCard,
};
