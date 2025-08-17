// src/components/ui/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
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
          {children}
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
          {children}
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
          {children}
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
          {children}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
});
