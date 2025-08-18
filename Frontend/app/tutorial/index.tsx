import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  FlatList,
  ListRenderItem
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { ViewToken } from 'react-native';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';
import { Typography } from '../../src/components/ui';

type Slide = {
  id: string;
  title: string;
  description: string;
  color: string;
  gradient: string[];
  icon: string;
  features: string[];
  actionText?: string;
};

const { width } = Dimensions.get('window');

const slides: Slide[] = [
  {
    id: '1',
    title: 'Bienvenue sur BourseX',
    description: 'Votre plateforme de trading professionnelle avec réalité augmentée',
    color: '#6A5ACD',
    gradient: ['#6A5ACD', '#4B0082', '#9370DB'],
    icon: '🚀',
    features: [
      'Interface AR immersive',
      'Trading sécurisé et simulé',
      'Gamification avancée',
      'Portfolio en temps réel'
    ],
    actionText: 'Découvrir'
  },
  {
    id: '2',
    title: 'Trading Intelligent',
    description: 'Achetez et vendez des cryptomonnaies avec des outils professionnels',
    color: '#4682B4',
    gradient: ['#4682B4', '#1E90FF', '#87CEEB'],
    icon: '📊',
    features: [
      'Graphiques en temps réel',
      'Analyses techniques',
      'Alertes de prix',
      'Historique complet'
    ],
    actionText: 'Explorer'
  },
  {
    id: '3',
    title: 'Portfolio Dynamique',
    description: 'Suivez vos investissements avec une visualisation AR avancée',
    color: '#20B2AA',
    gradient: ['#20B2AA', '#48D1CC', '#00CED1'],
    icon: '💎',
    features: [
      'Vue AR immersive',
      'Calculs automatiques',
      'Répartition visuelle',
      'Performances détaillées'
    ],
    actionText: 'Visualiser'
  },
  {
    id: '4',
    title: 'Gamification Complète',
    description: 'Gagnez des badges, montez de niveau et défiez vos amis',
    color: '#9370DB',
    gradient: ['#9370DB', '#BA55D3', '#DA70D6'],
    icon: '🏆',
    features: [
      'Système XP/Niveaux',
      'Badges et achievements',
      'Missions quotidiennes',
      'Classements globaux'
    ],
    actionText: 'Jouer'
  },
  {
    id: '5',
    title: 'Notifications Smart',
    description: 'Restez informé avec des alertes intelligentes et personnalisées',
    color: '#FF6347',
    gradient: ['#FF6347', '#FF7F50', '#FF8C00'],
    icon: '🔔',
    features: [
      'Alertes de prix',
      'Notifications push',
      'Rappels de missions',
      'Actualités du marché'
    ],
    actionText: 'Configurer'
  },
  {
    id: '6',
    title: 'Leaderboard Social',
    description: 'Comparez vos performances avec la communauté BourseX',
    color: '#32CD32',
    gradient: ['#32CD32', '#00FF00', '#7FFF00'],
    icon: '🥇',
    features: [
      'Classements en temps réel',
      'Statistiques détaillées',
      'Défis communautaires',
      'Récompenses exclusives'
    ],
    actionText: 'Rivaliser'
  },
  {
    id: '7',
    title: 'Analyse Avancée',
    description: 'Outils d\'analyse professionnels pour optimiser vos trades',
    color: '#FF1493',
    gradient: ['#FF1493', '#FF69B4', '#FFB6C1'],
    icon: '📈',
    features: [
      'Indicateurs techniques',
      'Backtesting',
      'Signaux automatiques',
      'Rapports détaillés'
    ],
    actionText: 'Analyser'
  },
  {
    id: '8',
    title: 'Sécurité Premium',
    description: 'Vos données et transactions sont protégées par un cryptage avancé',
    color: '#DC143C',
    gradient: ['#DC143C', '#B22222', '#CD5C5C'],
    icon: '🛡️',
    features: [
      'Authentification JWT',
      'Cryptage end-to-end',
      'Backup automatique',
      'Conformité RGPD'
    ],
    actionText: 'Sécuriser'
  },
  {
    id: '9',
    title: 'Prêt à Commencer !',
    description: 'Rejoignez des milliers de traders qui font confiance à BourseX',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA500', '#FF8C00'],
    icon: '🎯',
    features: [
      'Inscription gratuite',
      'Solde de démo inclus',
      'Support 24/7',
      'Communauté active'
    ],
    actionText: 'Commencer'
  }
];

export default function TutorialScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<Slide>[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      
      // Animation pour chaque changement de slide
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
    return {};
  }).current;

  const viewConfig = React.useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleSkip = () => {
    router.replace('/dashboard');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      router.replace('/dashboard');
    }
  };

  const scrollTo = (index: number) => {
    if (slidesRef.current && index >= 0 && index < slides.length) {
      slidesRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  const renderItem: ListRenderItem<Slide> = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [-width * 0.3, 0, width * 0.3],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <LinearGradient
        colors={item.gradient as any}
        style={[styles.slide]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.slideContent,
            {
              transform: [{ translateX }, { scale }],
              opacity,
            }
          ]}
        >
          {/* Header avec icon */}
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.iconBackground}
            >
              <Text style={styles.icon}>{item.icon}</Text>
            </LinearGradient>
            
            <View style={styles.glowEffect} />
          </Animated.View>

          {/* Titre et description */}
          <Animated.View 
            style={[
              styles.textContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Typography variant="h1" color="white" weight="700" style={styles.title}>
              {item.title}
            </Typography>
            <Typography variant="body1" color="white" style={styles.description}>
              {item.description}
            </Typography>
          </Animated.View>

          {/* Liste des fonctionnalités */}
          <Animated.View 
            style={[
              styles.featuresContainer,
              { opacity: fadeAnim }
            ]}
          >
            {item.features.map((feature, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.featureItem,
                  {
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.featureIcon}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
                <Typography variant="body2" color="white" style={styles.featureText}>
                  {feature}
                </Typography>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Action Button pour interaction */}
          {item.actionText && (
            <Animated.View
              style={[
                styles.actionContainer,
                { opacity: fadeAnim }
              ]}
            >
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  // Animation de feedback
                  Animated.sequence([
                    Animated.timing(scaleAnim, {
                      toValue: 0.95,
                      duration: 100,
                      useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                      toValue: 1,
                      duration: 100,
                      useNativeDriver: true,
                    }),
                  ]).start();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Typography 
                    variant="h4" 
                    style={{ ...styles.actionText, color: item.color }} 
                    weight="600"
                  >
                    {item.actionText}
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        {/* Particules décoratives */}
        <View style={styles.particlesContainer}>
          {[...Array(6)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3],
                  }),
                  transform: [{
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity
              key={index}
              onPress={() => scrollTo(index)}
              style={styles.dotTouchable}
            >
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: currentIndex === index ? '#FFD700' : 'rgba(255,255,255,0.5)',
                  }
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderProgress = () => {    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: scrollX.interpolate({
                  inputRange: [0, (slides.length - 1) * width],
                  outputRange: ['11%', '100%'],
                  extrapolate: 'clamp',
                })
              }
            ]}
          />
        </View>
        <Typography variant="caption" color="white" style={styles.progressText}>
          {currentIndex + 1} / {slides.length}
        </Typography>
      </View>
    );
  };

  return (
    <ResponsiveScreenWrapper showBottomTabs={false}>
      <View style={styles.container}>
        {/* Progress Bar */}
        {renderProgress()}

        {/* Slides */}
        <Animated.FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          scrollEventThrottle={16}
        />

        {/* Navigation dots */}
        {renderDots()}

        {/* Footer navigation */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Typography variant="h4" color="white" style={styles.skipText}>
              Passer
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.nextButton,
              currentIndex === slides.length - 1 && styles.finishButton
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={currentIndex === slides.length - 1 
                ? ['#FFD700', '#FFA500'] 
                : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']
              }
              style={styles.nextGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Typography 
                variant="h4" 
                color={currentIndex === slides.length - 1 ? "white" : "white"} 
                weight="600"
                style={styles.nextText}
              >
                {currentIndex === slides.length - 1 ? '🚀 Commencer' : 'Suivant →'}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ResponsiveScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width,
    flex: 1,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -10,
    left: -10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkmark: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    opacity: 0.9,
  },
  actionContainer: {
    marginTop: 20,
  },
  actionButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 18,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    right: 30,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  dotTouchable: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    paddingBottom: 50,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    opacity: 0.7,
    fontSize: 16,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  finishButton: {
    transform: [{ scale: 1.1 }],
  },
  nextGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 120,
  },
  nextText: {
    fontSize: 16,
  },
});
