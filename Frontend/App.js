import React from 'react'
import { Welcome, Home } from './src/screens'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native';
import { GamificationProvider } from './src/contexts/GamificationContext';
import BadgesScreen from './src/screens/BadgesScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';


const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <GamificationProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen 
            name="Badges" 
            component={BadgesScreen}
            options={{ 
              headerShown: true, 
              title: 'Mes Badges',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#fff'
            }} 
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ 
              headerShown: true, 
              title: 'Classements',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#fff'
            }} 
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ 
              headerShown: true, 
              title: 'Notifications',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#fff'
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GamificationProvider>
  )
}

export default App