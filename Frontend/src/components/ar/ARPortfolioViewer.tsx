import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../ui';
import { ARMoneyDisplay } from './ARMoneyDisplay';
import { useTheme } from '../../config/theme';

interface ARPortfolioViewerProps {
  portfolioData: any[];
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
}

export const ARPortfolioViewer: React.FC<ARPortfolioViewerProps> = ({
  portfolioData,
  totalValue,
  totalGain,
  totalGainPercent
}) => {
  const theme = useTheme();
  const [animatedValues] = useState(
    portfolioData.map(() => new Animated.Value(0))
  );
  const [rotateAnim] = useState(new Animated.Value(0));
  const [floatAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Staggered entrance animation
    const animations = animatedValues.map((animValue, index) => 
      Animated.timing(animValue, {
        toValue: 1,
        duration: 800,
        delay: index * 200,
        useNativeDriver: true,
      })
    );

    // Floating animation
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
    floatingAnimation.start();
    rotationAnimation.start();

    return () => {
      floatingAnimation.stop();
      rotationAnimation.stop();
    };
  }, [portfolioData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('mg-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const float = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      {/* AR Background */}
      <View style={styles.arBackground}>
        <Animated.View
          style={[
            styles.backgroundOrb1,
            {
              transform: [{ rotate }],
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.1)', 'transparent']}
            style={styles.orbGradient}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.backgroundOrb2,
            {
              transform: [{ rotate: rotate }, { translateY: float }],
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'transparent']}
            style={styles.orbGradient}
          />
        </Animated.View>
      </View>

      {/* Header with Total Portfolio Value */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: float }],
          }
        ]}
      >
        <ARMoneyDisplay
          amount={totalValue}
          label="Valeur Totale"
          type="portfolio"
          size="large"
          animated={true}
        />
        
        <View style={styles.gainContainer}>
          <ARMoneyDisplay
            amount={totalGain}
            label={`Gain Total (${totalGainPercent.toFixed(2)}%)`}
            type={totalGain >= 0 ? 'gain' : 'loss'}
            size="medium"
            animated={true}
          />
        </View>
      </Animated.View>

      {/* AR Portfolio Grid */}
      <ScrollView
        style={styles.portfolioGrid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
        {portfolioData.map((item, index) => {
          const animValue = animatedValues[index];
          const currentValue = item.quantity * item.current_price;
          const gainLoss = currentValue - (item.quantity * item.average_price);
          const gainPercent = ((currentValue - (item.quantity * item.average_price)) / (item.quantity * item.average_price)) * 100;

          return (
            <Animated.View
              key={item.stock_symbol}
              style={[
                styles.portfolioItem,
                {
                  opacity: animValue,
                  transform: [
                    {
                      scale: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                    {
                      translateY: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <BlurView intensity={15} style={styles.itemBlur}>
                <LinearGradient
                  colors={[
                    'rgba(15, 23, 42, 0.9)',
                    'rgba(30, 41, 59, 0.8)',
                  ]}
                  style={styles.itemContent}
                >
                  {/* Stock Header */}
                  <View style={styles.stockHeader}>
                    <View style={styles.stockIcon}>
                      <Ionicons
                        name="trending-up"
                        size={20}
                        color={gainLoss >= 0 ? '#10B981' : '#EF4444'}
                      />
                    </View>
                    <View style={styles.stockInfo}>
                      <Typography variant="h4" color="white" weight="600">
                        {item.stock_symbol}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.quantity} actions
                      </Typography>
                    </View>
                    <View style={styles.priceChange}>
                      <Typography
                        variant="caption"
                        color={gainLoss >= 0 ? '#10B981' : '#EF4444'}
                        weight="600"
                      >
                        {gainPercent > 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                      </Typography>
                    </View>
                  </View>

                  {/* AR Money Values */}
                  <View style={styles.arMoneyContainer}>
                    <View style={styles.moneyRow}>
                      <ARMoneyDisplay
                        amount={currentValue}
                        label="Valeur Actuelle"
                        type="portfolio"
                        size="small"
                        animated={true}
                      />
                      <ARMoneyDisplay
                        amount={gainLoss}
                        label="Gain/Perte"
                        type={gainLoss >= 0 ? 'gain' : 'loss'}
                        size="small"
                        animated={true}
                      />
                    </View>
                  </View>

                  {/* Price Details */}
                  <View style={styles.priceDetails}>
                    <View style={styles.priceRow}>
                      <Typography variant="caption" color="textSecondary">
                        Prix Actuel
                      </Typography>
                      <Typography variant="caption" color="white" weight="600">
                        {formatCurrency(item.current_price)}
                      </Typography>
                    </View>
                    <View style={styles.priceRow}>
                      <Typography variant="caption" color="textSecondary">
                        Prix Moyen
                      </Typography>
                      <Typography variant="caption" color="white" weight="600">
                        {formatCurrency(item.average_price)}
                      </Typography>
                    </View>
                  </View>

                  {/* AR Particles for each item */}
                  <View style={styles.itemParticles}>
                    {Array.from({ length: 3 }).map((_, particleIndex) => (
                      <Animated.View
                        key={particleIndex}
                        style={[
                          styles.particle,
                          {
                            backgroundColor: gainLoss >= 0 ? '#10B981' : '#EF4444',
                            transform: [
                              {
                                translateY: animValue.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -20 - particleIndex * 5],
                                }),
                              },
                            ],
                            opacity: animValue.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 1, 0.3],
                            }),
                          },
                        ]}
                      />
                    ))}
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>
          );
        })}
      </ScrollView>
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
  backgroundOrb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: -150,
    right: -150,
  },
  backgroundOrb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    bottom: -100,
    left: -100,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 150,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  gainContainer: {
    marginTop: 20,
  },
  portfolioGrid: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gridContent: {
    paddingBottom: 100,
  },
  portfolioItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  itemBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemContent: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stockInfo: {
    flex: 1,
  },
  priceChange: {
    alignItems: 'flex-end',
  },
  arMoneyContainer: {
    marginBottom: 16,
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  priceDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemParticles: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 20,
    height: 20,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
