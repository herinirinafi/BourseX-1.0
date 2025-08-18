import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { useTheme } from '../../config/theme';

interface ARMoneyDisplayProps {
  amount: number;
  currency?: string;
  label?: string;
  type?: 'balance' | 'profit' | 'loss' | 'portfolio' | 'gain';
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ARMoneyDisplay: React.FC<ARMoneyDisplayProps> = ({
  amount,
  currency = 'MGA',
  label,
  type = 'balance',
  animated = true,
  size = 'medium'
}) => {
  const theme = useTheme();
  const [displayAmount, setDisplayAmount] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (animated) {
      // Animate the counter
      const animation = Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      });

      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );

      animation.start();
      rotateAnimation.start();
      glowAnimation.start();

      // Animate the number counting
      const duration = 1500;
      const steps = 60;
      const stepValue = amount / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setDisplayAmount(Math.min(stepValue * currentStep, amount));
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);

      return () => {
        clearInterval(timer);
        rotateAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      setDisplayAmount(amount);
    }
  }, [amount, animated]);

  const getTypeConfig = () => {
    switch (type) {
      case 'profit':
      case 'gain':
        return {
          colors: ['#10B981', '#34D399'],
          icon: 'trending-up',
          shadowColor: '#10B981',
        };
      case 'loss':
        return {
          colors: ['#EF4444', '#F87171'],
          icon: 'trending-down',
          shadowColor: '#EF4444',
        };
      case 'portfolio':
        return {
          colors: ['#8B5CF6', '#A78BFA'],
          icon: 'briefcase',
          shadowColor: '#8B5CF6',
        };
      default:
        return {
          colors: ['#FFD700', '#FFA500'],
          icon: 'card',
          shadowColor: '#FFD700',
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 120,
          fontSize: 16,
          iconSize: 24,
          padding: 12,
        };
      case 'large':
        return {
          containerSize: 200,
          fontSize: 28,
          iconSize: 40,
          padding: 24,
        };
      default:
        return {
          containerSize: 160,
          fontSize: 20,
          iconSize: 32,
          padding: 16,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const sizeConfig = getSizeConfig();

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={[styles.container, { width: sizeConfig.containerSize, height: sizeConfig.containerSize }]}>
      {/* AR Glow Effect */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: sizeConfig.containerSize + 20,
            height: sizeConfig.containerSize + 20,
            borderRadius: (sizeConfig.containerSize + 20) / 2,
            opacity: glowOpacity,
            shadowColor: typeConfig.shadowColor,
          }
        ]}
      />

      {/* Rotating Border */}
      <Animated.View
        style={[
          styles.rotatingBorder,
          {
            width: sizeConfig.containerSize,
            height: sizeConfig.containerSize,
            borderRadius: sizeConfig.containerSize / 2,
            transform: [{ rotate }],
          }
        ]}
      >
        <LinearGradient
          colors={[...typeConfig.colors, 'transparent', 'transparent']}
          style={[styles.borderGradient, { borderRadius: sizeConfig.containerSize / 2 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            width: sizeConfig.containerSize - 8,
            height: sizeConfig.containerSize - 8,
            borderRadius: (sizeConfig.containerSize - 8) / 2,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.9)', 'rgba(30, 41, 59, 0.8)']}
            style={[styles.innerContent, { borderRadius: (sizeConfig.containerSize - 8) / 2 }]}
          >
            {/* Icon */}
            <Ionicons
              name={typeConfig.icon as any}
              size={sizeConfig.iconSize}
              color={typeConfig.colors[0]}
              style={styles.icon}
            />

            {/* Amount */}
            <Typography
              variant="h3"
              color="white"
              weight="700"
              style={[styles.amount, { fontSize: sizeConfig.fontSize }]}
            >
              {formatAmount(displayAmount)}
            </Typography>

            {/* Label */}
            {label && (
              <Typography
                variant="caption"
                color="textSecondary"
                style={styles.label}
              >
                {label}
              </Typography>
            )}

            {/* AR Particles */}
            <View style={styles.particles}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: typeConfig.colors[0],
                      transform: [
                        {
                          rotate: `${index * 60}deg`,
                        },
                        {
                          translateY: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -10],
                          }),
                        },
                      ],
                      opacity: glowOpacity,
                    }
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  rotatingBorder: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  borderGradient: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  innerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  icon: {
    marginBottom: 8,
  },
  amount: {
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
  },
  particles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    top: '50%',
    left: '50%',
    marginLeft: -2,
    marginTop: -2,
  },
});
