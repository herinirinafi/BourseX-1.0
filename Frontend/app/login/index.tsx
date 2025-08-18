import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Animated, Platform, KeyboardAvoidingView, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, GlassCard } from '../../src/components/ui';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/authService';
import { showToast } from '../../src/services/toast';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, loginWithToken, setRefresh } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Professional animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Veuillez entrer votre identifiant et mot de passe');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await authService.login(username.trim(), password);
      loginWithToken(res.access);
      setRefresh(res.refresh);
      showToast.success('Connecté', `Bienvenue ${username}`);
      router.replace('/dashboard');
    } catch (e: any) {
      const msg = e?.message || 'Échec de connexion';
      setError(msg);
      showToast.error('Connexion échouée', msg);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    router.replace('/dashboard');
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#0F172A', '#1E293B', '#374151']} style={styles.container}>
          {/* Professional Background Effects */}
          <View style={styles.backgroundEffects}>
            {/* Golden glow effects */}
            <LinearGradient
              colors={['rgba(255, 215, 0, 0.15)', 'transparent']}
              style={[styles.glowOrb, styles.glowOrb1]}
            />
            <LinearGradient
              colors={['rgba(30, 58, 138, 0.1)', 'transparent']}
              style={[styles.glowOrb, styles.glowOrb2]}
            />
            <LinearGradient
              colors={['rgba(255, 215, 0, 0.08)', 'transparent']}
              style={[styles.glowOrb, styles.glowOrb3]}
            />
          </View>

      {/* Animated Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Professional Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FFD700', '#B8860B']}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="diamond" size={40} color="white" />
              <View style={styles.logoAccent}>
                <Ionicons name="trending-up" size={20} color="#0F172A" />
              </View>
            </LinearGradient>
          </View>
          <Typography variant="h1" color="white" weight="700" style={styles.title}>
            BourseX Pro
          </Typography>
          <Typography variant="body1" color="textSecondary" align="center" style={styles.subtitle}>
            Plateforme de Trading Professionnelle
          </Typography>
          <Typography variant="caption" color="textSecondary" align="center" style={styles.tagline}>
            Excellence • Innovation • Performance
          </Typography>
        </View>

        {/* Enhanced Login Form */}
        <BlurView intensity={20} style={styles.loginCardBlur}>
          <GlassCard style={styles.loginCard} padding="lg">
            <View style={styles.formHeader}>
              <Typography variant="h3" color="white" weight="600" style={styles.formTitle}>
                Connexion Sécurisée
              </Typography>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Typography variant="caption" color="success" style={styles.securityText}>
                  Chiffré SSL
                </Typography>
              </View>
            </View>
            
            {/* Professional Username Field */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="textSecondary" style={styles.inputLabel}>
                Nom d&apos;utilisateur
              </Typography>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="person-outline" size={20} color="#FFD700" />
                </View>
                <TextInput
                  placeholder="Entrez votre nom d'utilisateur"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={username}
                  onChangeText={setUsername}
                  style={[styles.input, { borderColor: 'rgba(255, 215, 0, 0.2)', color: '#FFFFFF' }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Professional Password Field */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="textSecondary" style={styles.inputLabel}>
                Mot de passe
              </Typography>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#FFD700" />
                </View>
                <TextInput
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, { borderColor: 'rgba(255, 215, 0, 0.2)', color: '#FFFFFF' }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {!!error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                <Typography variant="caption" color="error" style={styles.errorText}>
                  {error}
                </Typography>
              </View>
            )}

            {/* Professional Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              disabled={loading || !username.trim() || !password.trim()}
            >
              <LinearGradient
                colors={loading ? ['#64748B', '#475569'] : ['#FFD700', '#B8860B']}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="white" size="small" />
                    <Typography variant="body1" color="white" weight="600" style={styles.loadingText}>
                      Connexion...
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="log-in-outline" size={20} color="#0F172A" />
                    <Typography variant="body1" color="white" weight="700" style={styles.buttonText}>
                      Se connecter
                    </Typography>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Demo Credentials */}
            <View style={styles.demoContainer}>
              <Typography variant="caption" color="textSecondary" align="center" style={styles.demoTitle}>
                💎 Compte de démonstration premium
              </Typography>
              <View style={styles.demoCredentials}>
                <View style={styles.demoItem}>
                  <Ionicons name="person" size={14} color="#FFD700" />
                  <Typography variant="caption" color="white">
                    testuser
                  </Typography>
                </View>
                <View style={styles.demoItem}>
                  <Ionicons name="key" size={14} color="#FFD700" />
                  <Typography variant="caption" color="white">
                    testpass123
                  </Typography>
                </View>
              </View>
            </View>
          </GlassCard>
        </BlurView>
      </Animated.View>
    </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: Dimensions.get('window').height, // Ensure minimum height
  },
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowOrb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  glowOrb1: {
    top: -200,
    right: -200,
  },
  glowOrb2: {
    bottom: -200,
    left: -200,
  },
  glowOrb3: {
    top: '50%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -200 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40, // Add vertical padding for better spacing
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height - 100, // Reserve space for keyboard
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 12,
    position: 'relative',
  },
  logoAccent: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  title: {
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    opacity: 0.9,
    marginBottom: 4,
  },
  tagline: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  loginCardBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  loginCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  securityText: {
    marginLeft: 4,
    fontSize: 11,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  inputIconContainer: {
    paddingLeft: 20,
    paddingRight: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    paddingRight: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  passwordToggle: {
    paddingHorizontal: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
  },
  loginButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 8,
    color: '#0F172A', // Dark color for button text on golden background
  },
  demoContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
  },
  demoTitle: {
    marginBottom: 12,
  },
  demoCredentials: {
    flexDirection: 'row',
    gap: 20,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 6,
  },
});
