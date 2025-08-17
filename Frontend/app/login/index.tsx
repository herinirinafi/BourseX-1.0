import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Typography, GlassCard } from '../../src/components/ui';
import { useTheme } from '../../src/config/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/authService';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated, loginWithToken, logout } = useAuth();
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    if (!token.trim()) {
      setError('Veuillez entrer un token');
      return;
    }
    setError(null);
    loginWithToken(token.trim());
    router.replace('/dashboard');
  };

  const handleCredentialsLogin = async () => {
    try {
      if (!username || !password) {
        setError('Entrez un identifiant et un mot de passe');
        return;
      }
      setError(null);
      const res = await authService.login(username.trim(), password);
      loginWithToken(res.access);
      router.replace('/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Échec de connexion');
    }
  };

  const handleLogout = () => {
    logout();
    setToken('');
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']} style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h2" weight="700">Connexion</Typography>
  <Typography variant="body2" color="textSecondary">Collez votre token pour activer l&#39;authentification</Typography>
      </View>

      <GlassCard padding="lg" style={styles.card}>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
          Connexion par identifiants (JWT)
        </Typography>
        <TextInput
          placeholder="Nom d'utilisateur"
          placeholderTextColor={theme.colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleCredentialsLogin} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
          <Typography variant="body1" color="white" weight="700" align="center">Se connecter</Typography>
        </TouchableOpacity>

        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
          Token d&#39;accès (JWT ou similaire)
        </Typography>
        <TextInput
          placeholder="Ex: eyJhbGciOiJI..."
          placeholderTextColor={theme.colors.textSecondary}
          value={token}
          onChangeText={setToken}
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />
        {!!error && (
          <Typography variant="caption" color="error" style={{ marginTop: 8 }}>{error}</Typography>
        )}

        <TouchableOpacity onPress={handleLogin} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
          <Typography variant="body1" color="white" weight="700" align="center">Valider le token</Typography>
        </TouchableOpacity>

        {isAuthenticated && (
          <TouchableOpacity onPress={handleLogout} style={[styles.buttonSecondary, { borderColor: theme.colors.border }]}>
            <Typography variant="body1" color="text" weight="600" align="center">Se déconnecter</Typography>
          </TouchableOpacity>
        )}
      </GlassCard>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 60, paddingBottom: 24, alignItems: 'center' },
  card: { gap: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonSecondary: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});
