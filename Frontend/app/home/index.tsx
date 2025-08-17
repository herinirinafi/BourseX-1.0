import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';

type MenuItem = {
  id: string;
  title: string;
  icon: string;
  path: `/${string}`;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', title: 'Tableau de bord', icon: '📊', path: '/dashboard' },
  { id: 'trading', title: 'Trading', icon: '📈', path: '/trading' },
  { id: 'portfolio', title: 'Portefeuille', icon: '💰', path: '/portfolio' },
  { id: 'leaderboard', title: 'Classement', icon: '🏆', path: '/leaderboard' },
  { id: 'missions', title: 'Missions', icon: '🎯', path: '/missions' },
  { id: 'search', title: 'Recherche', icon: '🔍', path: '/search' },
];

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bienvenue sur</Text>
          <Text style={styles.appTitle}>BourseX</Text>
          <Text style={styles.subtitle}>Gérez vos investissements en toute simplicité</Text>
        </View>

        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <Link href={item.path as any} key={item.id} asChild>
              <TouchableOpacity style={styles.card}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardText}>{item.title}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 BourseX</Text>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomTabBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    color: '#a7a7a7',
    fontSize: 18,
    marginBottom: 5,
  },
  appTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#a7a7a7',
    fontSize: 16,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  card: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    marginTop: 40,
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
});
