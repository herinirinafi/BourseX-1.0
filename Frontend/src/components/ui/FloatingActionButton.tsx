// src/components/ui/FloatingActionButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../config/theme';

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  style,
  size = 'lg',
  variant = 'primary',
}) => {
  const theme = useTheme();
  
  const sizeConfig = {
    md: { width: 48, height: 48, iconSize: 20 },
    lg: { width: 56, height: 56, iconSize: 24 },
  };
  
  const config = sizeConfig[size];
  const gradientColors = variant === 'primary' ? theme.gradients.primary : theme.gradients.secondary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: config.width,
          height: config.height,
        },
        theme.shadows.lg,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors as any}
        style={[
          styles.gradient,
          {
            width: config.width,
            height: config.height,
            borderRadius: config.width / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons 
          name={icon} 
          size={config.iconSize} 
          color={theme.colors.textInverse} 
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
