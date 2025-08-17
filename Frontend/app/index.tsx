// app/index.tsx
import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Typography, Button, GlassCard } from '../src/components/ui';
import { useTheme } from '../src/config/theme';
import { BottomTabBar } from '../src/components/navigation/BottomTabBar';

export default function WelcomeScreen() {
  const theme = useTheme();
  
  return (
    <LinearGradient
      colors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, theme.shadows.xl]}>
            <LinearGradient
              colors={theme.gradients.primary as any}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Typography variant="h2" color="white" weight="700">
                BX
              </Typography>
            </LinearGradient>
          </View>
          
          <Typography variant="h1" color="text" align="center" style={styles.title}>
            BourseX
          </Typography>
          
          <Typography variant="body1" color="textSecondary" align="center" style={styles.subtitle}>
            L'avenir du trading crypto
          </Typography>
        </View>

        {/* Features Cards */}
        <View style={styles.featuresContainer}>
          <GlassCard style={styles.featureCard} padding="lg">
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.success }]}>
                <Typography variant="h4" color="white">🚀</Typography>
              </View>
              <View style={styles.featureText}>
                <Typography variant="h4" color="text" weight="600">
                  Trading Intelligent
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  IA avancée pour optimiser vos trades
                </Typography>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.featureCard} padding="lg">
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary }]}>
                <Typography variant="h4" color="white">🎯</Typography>
              </View>
              <View style={styles.featureText}>
                <Typography variant="h4" color="text" weight="600">
                  Gamification
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gagnez des badges et montez de niveau
                </Typography>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.featureCard} padding="lg">
            <View style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.accent }]}>
                <Typography variant="h4" color="white">📊</Typography>
              </View>
              <View style={styles.featureText}>
                <Typography variant="h4" color="text" weight="600">
                  Analytics Avancées
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Insights détaillés sur vos performances
                </Typography>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/dashboard" asChild>
            <Button
              title="Commencer l'aventure"
              onPress={() => {}}
              variant="gradient"
              size="lg"
              fullWidth
            />
          </Link>
          
          <View style={styles.quickNavigation}>
            <Link href="/trading" asChild>
              <Button
                title="Trading"
                onPress={() => {}}
                variant="outline"
                size="md"
                style={styles.quickNavButton}
              />
            </Link>
            
            <Link href="/portfolio" asChild>
              <Button
                title="Portfolio"
                onPress={() => {}}
                variant="outline"
                size="md"
                style={styles.quickNavButton}
              />
            </Link>
          </View>
        </View>
      </View>
      
      {/* Bottom Navigation */}
      <BottomTabBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 40,
  },
  featuresContainer: {
    gap: 16,
  },
  featureCard: {
    marginVertical: 0,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
  },
  quickNavigation: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickNavButton: {
    flex: 1,
  },
  secondaryButton: {
    marginTop: 8,
  },
});