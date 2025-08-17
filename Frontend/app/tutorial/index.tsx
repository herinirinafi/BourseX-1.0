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
import type { ViewToken } from 'react-native';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';

type Slide = {
  id: string;
  title: string;
  description: string;
  color: string;
  // Ajout de la propriété image optionnelle
  image?: any;
};

const { width } = Dimensions.get('window');

const slides: Slide[] = [
  {
    id: '1',
    title: 'Bienvenue sur BourseX',
    description: 'Découvrez le trading de cryptomonnaies de manière ludique et sécurisée',
    color: '#6A5ACD',
  },
  {
    id: '2',
    title: 'Achetez et vendez',
    description: 'Parcourez le marché et effectuez vos premiers trades en quelques clics',
    color: '#4682B4',
  },
  {
    id: '3',
    title: 'Suivez votre portefeuille',
    description: 'Visualisez la performance de vos investissements en temps réel',
    color: '#20B2AA',
  },
  {
    id: '4',
    title: 'Défis et récompenses',
    description: 'Réalisez des missions pour gagner des récompenses et montez en niveau',
    color: '#9370DB',
  },
];

export default function TutorialScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide>>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<Slide>[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
    return {}; // Pour satisfaire le type attendu
  }).current;

  const viewConfig = React.useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleSkip = () => {
    // Navigation vers l'écran d'accueil
    router.replace('/');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      // Navigation vers l'écran d'accueil
      router.replace('/');
    }
  };

  const scrollTo = (index: number) => {
    if (slidesRef.current && index >= 0 && index < slides.length) {
      slidesRef.current.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  const renderItem: ListRenderItem<Slide> = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.color }]}>
        <View style={styles.imageContainer}>
          <View style={[styles.imagePlaceholder, { backgroundColor: `${item.color}33` }]}>
            <Text style={styles.placeholderText}>{item.title.split(' ')[0]}</Text>
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((slide, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
            onPress={() => scrollTo(index)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
      />
      
      {renderDots()}
      
      <View style={styles.footer}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextText}>Suivant</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={handleSkip}
          >
            <Text style={styles.getStartedText}>Commencer</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Bottom Navigation */}
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#FFF',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
