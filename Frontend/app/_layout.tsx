import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TradingProvider } from '../src/contexts/TradingContext';
import { GamificationProvider } from '../src/contexts/GamificationContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CurrencyProvider } from '../src/contexts/CurrencyContext';
import { I18nProvider } from '../src/contexts/I18nContext';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
  <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <AuthProvider>
        <I18nProvider defaultLang="fr">
        <CurrencyProvider>
        <TradingProvider>
          <GamificationProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#121212' },
              headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
            }}
          />
          <Toast position="top" topOffset={60} />
          </GamificationProvider>
        </TradingProvider>
        </CurrencyProvider>
        </I18nProvider>
      </AuthProvider>
    </View>
  );
}
