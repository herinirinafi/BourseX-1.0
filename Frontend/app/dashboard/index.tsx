import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tableau de Bord</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Portefeuille</Text>
        <Text style={styles.balance}>$0.00</Text>
        <Text style={styles.subtitle}>Solde total</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actifs</Text>
        <View style={styles.assetItem}>
          <Text>Bitcoin (BTC)</Text>
          <Text>$0.00</Text>
        </View>
        <View style={styles.assetItem}>
          <Text>Ethereum (ETH)</Text>
          <Text>$0.00</Text>
        </View>
      </View>

      <Link href="/" style={styles.link}>
        Retour à l'accueil
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  link: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#007AFF',
    color: 'white',
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
});
