import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

// Context Providers
import { StocksProvider } from './src/contexts/StocksContext.js';
import { WatchlistProvider } from './src/contexts/WatchlistContext.js';
import { AlertsProvider } from './src/contexts/AlertsContext.js';
import { PortfolioProvider } from './src/contexts/PortfolioContext.js';
import { NewsProvider } from './src/contexts/NewsContext.js';

// Screens
import LoginScreen from './src/screens/LoginScreen.js';
import SignUpScreen from './src/screens/SignUpScreen.js';
import HomeScreen from './src/screens/HomeScreen.js';
import WatchlistScreen from './src/screens/WatchlistScreen.js';
import PortfolioScreen from './src/screens/PortfolioScreen.js';
import NewsScreen from './src/screens/NewsScreen.js';
import SettingsScreen from './src/screens/SettingsScreen.js';
import StockDetailScreen from './src/screens/StockDetailScreen.js';
import AlertsScreen from './src/screens/AlertsScreen.js';
import StocksScreen from './src/screens/StocksScreen.js';

// Define all possible screens in the app
export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  SignUp: undefined;
  
  // Main App
  MainTabs: undefined;
  
  // Shared Screens
  StockDetail: { stockId: number };
  Alerts: undefined;
  Stocks: undefined;
};

// Define tab navigation screens
export type MainTabParamList = {
  HomeTab: undefined;
  WatchlistTab: undefined;
  PortfolioTab: undefined;
  NewsTab: undefined;
  SettingsTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof MainTabParamList } }) => ({
        tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'WatchlistTab') {
            iconName = 'star';
          } else if (route.name === 'PortfolioTab') {
            iconName = 'wallet';
          } else if (route.name === 'NewsTab') {
            iconName = 'newspaper';
          } else if (route.name === 'SettingsTab') {
            iconName = 'settings';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="WatchlistTab" 
        component={WatchlistScreen}
        options={{ title: 'Watchlist' }}
      />
      <Tab.Screen 
        name="PortfolioTab" 
        component={PortfolioScreen}
        options={{ title: 'Portfolio' }}
      />
      <Tab.Screen 
        name="NewsTab" 
        component={NewsScreen}
        options={{ title: 'News' }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <StocksProvider>
      <WatchlistProvider>
        <AlertsProvider>
          <PortfolioProvider>
            <NewsProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{
                    headerShown: true,
                    headerStyle: {
                      backgroundColor: '#fff',
                    },
                    headerShadowVisible: false,
                    headerTintColor: '#000',
                    headerTitleStyle: {
                      fontWeight: '600',
                    },
                    contentStyle: { 
                      backgroundColor: '#fff',
                    },
                  }}
                  initialRouteName="Login"
                >
                  {/* Auth Screens */}
                  <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ headerShown: false }}
                  />
 <Stack.Screen 
                    name="SignUp" 
                    component={SignUpScreen} 
                    options={{ title: 'Create Account' }}
                  />
                  
                  {/* Main App */}
                  <Stack.Screen 
                    name="MainTabs" 
                    component={MainTabs}
                    options={{
                      headerShown: false,
                      gestureEnabled: false,
                      headerLeft: () => null,
                    }}
                  />
                  
                  {/* Shared Screens */}
                  <Stack.Screen 
                    name="StockDetail" 
                    component={StockDetailScreen} 
                    options={{ 
                      title: 'Stock Details',
                      headerBackTitle: 'Back'
                    }}
                  />
                  <Stack.Screen 
                    name="Alerts" 
                    component={AlertsScreen} 
                    options={{ 
                      title: 'Price Alerts',
                      headerBackTitle: 'Back'
                    }}
                  />
                  <Stack.Screen 
                    name="Stocks" 
                    component={StocksScreen}
                    options={{ 
                      title: 'All Stocks',
                      headerBackTitle: 'Back'
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </NewsProvider>
          </PortfolioProvider>
        </AlertsProvider>
      </WatchlistProvider>
    </StocksProvider>
  );
};

export default App;
