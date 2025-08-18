// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../config/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const theme = useTheme();
  
  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.fontSize.sm,
    },
    md: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.fontSize.md,
    },
    lg: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      fontSize: theme.fontSize.lg,
    },
  };
  
  const currentSize = sizeStyles[size];
  
  const baseButtonStyle = [
    styles.button,
    {
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: currentSize.paddingHorizontal,
      paddingVertical: currentSize.paddingVertical,
      width: fullWidth ? '100%' as const : 'auto' as const,
    },
    disabled && styles.disabled,
    style,
  ];
  
  const baseTextStyle = [
    styles.text,
    {
      fontSize: currentSize.fontSize,
      fontWeight: '600' as const,
    },
    textStyle,
  ];

  if (variant === 'gradient') {
  const normalizedTitle = typeof title === 'string' || typeof title === 'number' ? String(title) : '';
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} style={baseButtonStyle}>
        <LinearGradient
          colors={theme.gradients.primary as any}
          style={[styles.gradientButton, { borderRadius: theme.borderRadius.md }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
      <Text style={[baseTextStyle, { color: theme.colors.textInverse }]}>{normalizedTitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.textInverse,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: theme.colors.accent,
      color: theme.colors.textInverse,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      borderWidth: 0,
      borderColor: 'transparent',
    },
  };
  
  const currentVariant = variantStyles[variant as keyof typeof variantStyles];
  
  return (
    <TouchableOpacity
      style={[
        baseButtonStyle,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderWidth: currentVariant.borderWidth,
          borderColor: currentVariant.borderColor,
        },
        theme.shadows.sm,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[baseTextStyle, { color: currentVariant.color }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
