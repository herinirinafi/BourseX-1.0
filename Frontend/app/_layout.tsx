import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TradingProvider } from '../src/contexts/TradingContext';
import { GamificationProvider } from '../src/contexts/GamificationContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <AuthProvider>
        <TradingProvider>
          <GamificationProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { 
              backgroundColor: '#121212',
            },
            headerTitleStyle: {
              color: '#FFFFFF',
              fontWeight: '600',
            },
          }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
            <Stack.Screen name="search" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="trading" />
            <Stack.Screen name="portfolio" />
            <Stack.Screen name="leaderboard" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="transactions" />
            <Stack.Screen name="missions" />
            <Stack.Screen name="tutorial" />
            <Stack.Screen name="login" />
          </Stack>
          </GamificationProvider>
        </TradingProvider>
      </AuthProvider>
    </View>
  );
}
