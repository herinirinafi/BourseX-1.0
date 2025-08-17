// src/components/ui/Typography.tsx
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '../../config/theme';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'white' | 'success' | 'error' | 'warning';
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700';
  children: React.ReactNode;
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'text',
  align = 'left',
  weight = 'normal',
  children,
  style,
}) => {
  const theme = useTheme();

  const variantStyles = {
    h1: {
      fontSize: theme.fontSize.xxxl,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: theme.fontSize.xxl,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: theme.fontSize.xl,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: theme.fontSize.lg,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    body1: {
      fontSize: theme.fontSize.md,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    body2: {
      fontSize: theme.fontSize.sm,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: theme.fontSize.xs,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    overline: {
      fontSize: theme.fontSize.xs,
      fontWeight: '500' as const,
      lineHeight: 16,
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
    },
  };

  const colorStyles = {
    primary: theme.colors.primary,
    secondary: theme.colors.textSecondary,
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    white: theme.colors.textInverse,
    success: theme.colors.success,
    error: theme.colors.error,
    warning: theme.colors.warning,
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        {
          color: colorStyles[color],
          textAlign: align,
          fontWeight: weight !== 'normal' ? weight : variantStyles[variant].fontWeight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
