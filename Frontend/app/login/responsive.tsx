import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Animated, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, GlassCard } from '../../src/components/ui';
import { 
  ResponsiveContainer, 
  ResponsiveScrollView, 
  ResponsiveCard 
} from '../../src/components/responsive/ResponsiveLayouts';
import { 
  ResponsiveText, 
  ResponsiveHeading, 
  ResponsiveButton 
} from '../../src/components/responsive/ResponsiveText';
import { useTheme } from '../../src/config/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/authService';
import { showToast } from '../../src/services/toast';
import { 
  isDesktop, 
  isTablet, 
  spacing, 
  fontSize, 
  borderRadius, 
  getModalDimensions 
} from '../../src/utils/responsive';

export default function ResponsiveLoginScreen() {
  const theme = useTheme();
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
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Veuillez entrer votre identifiant et mot de passe');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(username, password);
      if (result.accessToken) {
        await loginWithToken(result.accessToken);
        setRefresh && setRefresh(Date.now().toString());
        router.replace('/' as any);
        showToast.success('Connexion réussie', 'Bienvenue sur BourseX!');
      } else {
        setError('Échec de connexion');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/' as any);
    }
  }, [isAuthenticated, router]);

  const modalDimensions = getModalDimensions();

  const renderLoginForm = () => (
    <ResponsiveCard
      style={{
        backgroundColor: 'transparent',
        width: isDesktop ? modalDimensions.width : '100%',
        alignSelf: 'center',
      }}
      shadow={false}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={[
          styles.formContainer,
          {
            borderRadius: borderRadius.xl,
            padding: isDesktop ? spacing.xl * 1.5 : spacing.xl,
          }
        ]}
      >
        {/* Logo and Title */}
        <View style={styles.headerSection}>
          <ResponsiveHeading 
            level={1} 
            color="#FFD700" 
            textAlign="center"
            style={{ marginBottom: spacing.sm }}
          >
            BourseX
          </ResponsiveHeading>
          <ResponsiveText 
            size="lg" 
            color="#6B7280" 
            textAlign="center"
            style={{ marginBottom: spacing.xl }}
          >
            Plateforme de Trading Professionnelle
          </ResponsiveText>
        </View>

        {/* Error Message */}
        {error && (
          <ResponsiveCard
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderWidth: 1,
              marginBottom: spacing.lg,
            }}
          >
            <ResponsiveText size="sm" color="#FCA5A5" textAlign="center">
              {error}
            </ResponsiveText>
          </ResponsiveCard>
        )}

        {/* Username Input */}
        <View style={styles.inputGroup}>
          <ResponsiveText 
            size="base" 
            weight="medium" 
            color="#1A1D1F"
            style={{ marginBottom: spacing.sm }}
          >
            Nom d&apos;utilisateur
          </ResponsiveText>
          <View style={[styles.inputContainer, { 
            borderRadius: borderRadius.lg,
            padding: isDesktop ? spacing.md : spacing.sm 
          }]}>
            <Ionicons 
              name="person-outline" 
              size={isDesktop ? 24 : 20} 
              color="#6B7280" 
              style={{ marginRight: spacing.sm }}
            />
            <TextInput
              style={[styles.textInput, { 
                fontSize: isDesktop ? fontSize.lg : fontSize.base,
                flex: 1 
              }]}
              placeholder="Entrez votre nom d'utilisateur"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <ResponsiveText 
            size="base" 
            weight="medium" 
            color="#1A1D1F"
            style={{ marginBottom: spacing.sm }}
          >
            Mot de passe
          </ResponsiveText>
          <View style={[styles.inputContainer, { 
            borderRadius: borderRadius.lg,
            padding: isDesktop ? spacing.md : spacing.sm 
          }]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={isDesktop ? 24 : 20} 
              color="#6B7280" 
              style={{ marginRight: spacing.sm }}
            />
            <TextInput
              style={[styles.textInput, { 
                fontSize: isDesktop ? fontSize.lg : fontSize.base,
                flex: 1 
              }]}
              placeholder="Entrez votre mot de passe"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: spacing.xs }}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={isDesktop ? 24 : 20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <ResponsiveButton
          title={loading ? "Connexion..." : "Se connecter"}
          onPress={handleLogin}
          disabled={loading || !username.trim() || !password.trim()}
          loading={loading}
          variant="primary"
          size={isDesktop ? "lg" : "md"}
          fullWidth
          style={{ 
            marginTop: spacing.lg,
            backgroundColor: '#FFD700',
            borderColor: '#FFD700',
          }}
          textStyle={{ color: '#0F172A', fontWeight: 'bold' }}
        />

        {/* Demo Accounts */}
        <View style={{ marginTop: spacing.xl }}>
          <ResponsiveText 
            size="sm" 
            color="#6B7280" 
            textAlign="center"
            style={{ marginBottom: spacing.md }}
          >
            Comptes de démonstration:
          </ResponsiveText>
          
          <View style={{ 
            flexDirection: isDesktop ? 'row' : 'column',
            gap: spacing.sm,
            justifyContent: 'space-between' 
          }}>
            <TouchableOpacity
              style={[styles.demoButton, { flex: isDesktop ? 1 : undefined }]}
              onPress={() => {
                setUsername('testuser');
                setPassword('testpass123');
              }}
            >
              <ResponsiveText size="xs" color="#6B7280">
                Basic User
              </ResponsiveText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.demoButton, { 
                flex: isDesktop ? 1 : undefined,
                marginLeft: isDesktop ? spacing.sm : 0,
                marginTop: !isDesktop ? spacing.xs : 0 
              }]}
              onPress={() => {
                setUsername('vip_trader');
                setPassword('vippass123');
              }}
            >
              <ResponsiveText size="xs" color="#6B7280">
                VIP Trader
              </ResponsiveText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.demoButton, { 
                flex: isDesktop ? 1 : undefined,
                marginLeft: isDesktop ? spacing.sm : 0,
                marginTop: !isDesktop ? spacing.xs : 0 
              }]}
              onPress={() => {
                setUsername('pro_investor');
                setPassword('propass123');
              }}
            >
              <ResponsiveText size="xs" color="#6B7280">
                Pro Investor
              </ResponsiveText>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ResponsiveCard>
  );

  return (
    <LinearGradient
      colors={['#FAFBFC', '#F8FAFC', '#F1F5F9']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ResponsiveContainer style={styles.container}>
          <ResponsiveScrollView
            contentContainerStyle={StyleSheet.flatten([
              styles.scrollContent,
              {
                justifyContent: isDesktop ? 'center' : 'flex-start',
                paddingTop: isDesktop ? 0 : spacing.xl * 2,
              }
            ])}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {renderLoginForm()}
            </Animated.View>
          </ResponsiveScrollView>
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  formContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    color: '#1A1D1F',
    fontWeight: '500',
  },
  demoButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
});
