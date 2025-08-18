import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { ARMoneyDisplay } from './ARMoneyDisplay';
import { useTheme } from '../../config/theme';

interface ARDashboardProps {
  balance: number;
  totalPortfolio: number;
  todayGain: number;
  totalGain: number;
  xp: number;
  level: number;
  streakDays: number;
  animated?: boolean;
}

export const ARDashboard: React.FC<ARDashboardProps> = ({
  balance,
  totalPortfolio,
  todayGain,
  totalGain,
  xp,
  level,
  streakDays,
  animated = true
}) => {
  const theme = useTheme();
  const [mainAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [floatAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (animated) {
      // Main entrance animation
      Animated.timing(mainAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();

      // Continuous animations
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 30000,
          useNativeDriver: true,
        })
      );

      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );

      rotateAnimation.start();
      pulseAnimation.start();
      floatAnimation.start();

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
        floatAnimation.stop();
      };
    }
  }, [animated]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const float = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <View style={styles.container}>
      {/* AR Background Elements */}
      <View style={styles.arBackground}>
        <Animated.View
          style={[
            styles.rotatingRing,
            {
              transform: [{ rotate }],
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.3)', 'transparent', 'rgba(30, 58, 138, 0.3)', 'transparent']}
            style={styles.ringGradient}
          />
        </Animated.View>

        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingParticle,
              {
                top: `${15 + index * 10}%`,
                left: `${10 + index * 8}%`,
                transform: [
                  {
                    translateY: float,
                  },
                  {
                    rotate: `${index * 45}deg`,
                  },
                ],
                opacity: mainAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
              }
            ]}
          >
            <LinearGradient
              colors={['#FFD700', 'transparent']}
              style={styles.particle}
            />
          </Animated.View>
        ))}
      </View>

      {/* Main Dashboard Content */}
      <Animated.View
        style={[
          styles.dashboardContent,
          {
            opacity: mainAnim,
            transform: [
              {
                scale: mainAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        {/* Central Balance Display */}
        <Animated.View
          style={[
            styles.centralDisplay,
            {
              transform: [{ scale: pulseAnim }, { translateY: float }],
            }
          ]}
        >
          <BlurView intensity={25} style={styles.centralBlur}>
            <LinearGradient
              colors={['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.9)']}
              style={styles.centralContent}
            >
              <View style={styles.centralHeader}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
                <Typography variant="h4" color="white" weight="600" style={styles.centralTitle}>
                  Solde Total
                </Typography>
              </View>
              
              <ARMoneyDisplay
                amount={balance}
                label="Disponible"
                type="balance"
                size="large"
                animated={animated}
              />

              {/* Level and XP Display */}
              <View style={styles.levelContainer}>
                <View style={styles.levelBadge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Typography variant="caption" color="#FFD700" weight="600">
                    Niveau {level}
                  </Typography>
                </View>
                <Typography variant="caption" color="textSecondary">
                  {xp.toLocaleString()} XP
                </Typography>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Portfolio Section */}
        <Animated.View
          style={[
            styles.portfolioSection,
            {
              transform: [{ translateY: float }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase" size={20} color="#8B5CF6" />
            <Typography variant="h4" color="white" weight="600">
              Portfolio
            </Typography>
          </View>
          
          <View style={styles.portfolioGrid}>
            <ARMoneyDisplay
              amount={totalPortfolio}
              label="Valeur Totale"
              type="portfolio"
              size="medium"
              animated={animated}
            />
            <ARMoneyDisplay
              amount={totalGain}
              label="Gain Total"
              type={totalGain >= 0 ? 'gain' : 'loss'}
              size="medium"
              animated={animated}
            />
          </View>
        </Animated.View>

        {/* Today's Performance */}
        <Animated.View
          style={[
            styles.performanceSection,
            {
              transform: [{ translateY: float }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Typography variant="h4" color="white" weight="600">
              Performance du Jour
            </Typography>
          </View>
          
          <ARMoneyDisplay
            amount={todayGain}
            label="Gain Aujourd'hui"
            type={todayGain >= 0 ? 'gain' : 'loss'}
            size="medium"
            animated={animated}
          />
        </Animated.View>

        {/* Streak Display */}
        <Animated.View
          style={[
            styles.streakSection,
            {
              transform: [{ translateY: float }],
            }
          ]}
        >
          <BlurView intensity={15} style={styles.streakBlur}>
            <LinearGradient
              colors={['rgba(255, 215, 0, 0.1)', 'rgba(30, 58, 138, 0.1)']}
              style={styles.streakContent}
            >
              <View style={styles.streakHeader}>
                <Ionicons name="flame" size={24} color="#FF6B35" />
                <Typography variant="h4" color="white" weight="600">
                  Série Active
                </Typography>
              </View>
              
              <View style={styles.streakValue}>
                <Typography variant="h2" color="#FF6B35" weight="700">
                  {streakDays}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  jours consécutifs
                </Typography>
              </View>

              {/* Streak particles */}
              <View style={styles.streakParticles}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.streakParticle,
                      {
                        backgroundColor: '#FF6B35',
                        transform: [
                          {
                            translateY: floatAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -10 - index * 2],
                            }),
                          },
                        ],
                        opacity: floatAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.3, 1, 0.3],
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  arBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  rotatingRing: {
    position: 'absolute',
    width: Dimensions.get('window').width * 1.5,
    height: Dimensions.get('window').width * 1.5,
    top: -Dimensions.get('window').width * 0.25,
    left: -Dimensions.get('window').width * 0.25,
  },
  ringGradient: {
    flex: 1,
    borderRadius: Dimensions.get('window').width * 0.75,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  floatingParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
  },
  particle: {
    flex: 1,
    borderRadius: 3,
  },
  dashboardContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centralDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  centralBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    minWidth: 280,
  },
  centralContent: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 24,
  },
  centralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  centralTitle: {
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 4,
  },
  portfolioSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  portfolioGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  performanceSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  streakSection: {
    alignItems: 'center',
  },
  streakBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 200,
  },
  streakContent: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    borderRadius: 20,
    position: 'relative',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  streakValue: {
    alignItems: 'center',
    gap: 4,
  },
  streakParticles: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
  },
  streakParticle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
