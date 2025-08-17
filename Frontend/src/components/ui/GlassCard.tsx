// src/components/ui/GlassCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../config/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  padding?: 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  padding = 'md',
}) => {
  const theme = useTheme();
  
  const paddingValue = theme.spacing[padding];

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[
          styles.blurView,
          {
            borderRadius: theme.borderRadius.lg,
            padding: paddingValue,
          },
          theme.shadows.md,
        ]}
      >
        <View style={styles.overlay}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  blurView: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
});
