import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Link } from 'expo-router';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher..."
        placeholderTextColor="#999"
      />
      <Link href="/" style={styles.link}>
        Retour à l'accueil
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#007AFF',
    color: 'white',
    borderRadius: 5,
    textAlign: 'center',
  },
});
