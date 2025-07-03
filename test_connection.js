// Test de connexion à l'API BourseX
const axios = require('axios');

const API_URL = 'http://127.0.0.1:8000/api';

async function testConnection() {
  try {
    console.log('Tentative de connexion au backend...');
    
    // Test d'une route API publique (ajoutez une route de test si nécessaire)
    const response = await axios.get(`${API_URL}/`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Connexion réussie!');
    console.log('Réponse du serveur:', response.data);
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
    } else if (error.request) {
      console.error('Aucune réponse reçue du serveur');
    } else {
      console.error('Erreur lors de la configuration de la requête:', error.message);
    }
  }
}

testConnection();
