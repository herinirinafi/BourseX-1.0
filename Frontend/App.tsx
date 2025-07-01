import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StocksProvider } from './src/contexts/StocksContext';
import { Welcome } from './src/screens/Welcome';
import { Home } from './src/screens/Home';

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  // Add other screens here as needed
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <StocksProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
      </NavigationContainer>
    </StocksProvider>
  );
};

export default App;
