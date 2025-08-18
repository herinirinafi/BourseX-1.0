import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TradingProvider } from '../src/contexts/TradingContext';
import { GamificationProvider } from '../src/contexts/GamificationContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CurrencyProvider } from '../src/contexts/CurrencyContext';
import { I18nProvider } from '../src/contexts/I18nContext';
import { NavigationProvider } from '../src/contexts/NavigationContext';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
  <View style={{ flex: 1, backgroundColor: '#FAFBFC' }}>
      <AuthProvider>
        <I18nProvider>
        <CurrencyProvider>
        <NavigationProvider>
        <TradingProvider>
          <GamificationProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: '#FAFBFC' },
              headerTitleStyle: { color: '#1A1D1F', fontWeight: '600' },
            }}
          />
          <Toast position="top" topOffset={60} />
          </GamificationProvider>
        </TradingProvider>
        </NavigationProvider>
        </CurrencyProvider>
        </I18nProvider>
      </AuthProvider>
    </View>
  );
}
