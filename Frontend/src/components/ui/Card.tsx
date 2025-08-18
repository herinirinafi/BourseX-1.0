// src/components/ui/Card.tsx
import React, { Children } from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../config/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md'
}) => {
  const theme = useTheme();
  const normalizedChildren = Children.map(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return <Text>{child}</Text>;
    }
    return child as any;
  });
  
  const paddingValue = theme.spacing[padding];
  
  const cardStyles = [
    styles.card,
    {
      padding: paddingValue,
      borderRadius: theme.borderRadius.lg,
    },
    style,
  ];

  switch (variant) {
    case 'glass':
      return (
        <View style={[
          cardStyles,
          {
            backgroundColor: theme.colors.glassBackground,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          theme.shadows.md,
        ]}>
          {normalizedChildren}
        </View>
      );
      
    case 'gradient':
      return (
        <LinearGradient
          colors={theme.gradients.card as any}
          style={[cardStyles, theme.shadows.lg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {normalizedChildren}
        </LinearGradient>
      );
      
    case 'elevated':
      return (
        <View style={[
          cardStyles,
          {
            backgroundColor: theme.colors.surface,
          },
          theme.shadows.xl,
        ]}>
          {normalizedChildren}
        </View>
      );
      
    default:
      return (
        <View style={[
          cardStyles,
          {
            backgroundColor: theme.colors.surface,
          },
          theme.shadows.md,
        ]}>
          {normalizedChildren}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
});
