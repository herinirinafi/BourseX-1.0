import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import Dashboard from './Dashboard';
import Search from './Search';
import Icon from 'react-native-vector-icons/Ionicons'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const Tab = createBottomTabNavigator();

const Home = () => {
    const navigation = useNavigation();
    const [loaded, error] = useFonts({
        'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
        'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
        'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <Tab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: {
                position: 'absolute',
                marginBottom: '2%',
                marginTop: '2%',
                marginHorizontal: '2%',
                borderRadius: 10,
                height: 50,
                ...styles.shadow
            },
            tabBarShowLabel: false,
        }}>
            <Tab.Screen
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            <Icon name={focused ? 'home' : 'home-outline'} size={20} color={focused ? '#fff' : 'grey'} />
                            <Text style={{ color: focused ? '#fff' : 'grey', fontFamily: 'Roboto-Bold', fontSize: 10 }}>Dashboard</Text>
                        </View>
                    )
                }}
                name="Dashboard"
                component={Dashboard} />
            <Tab.Screen
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center' }}>
                            <Icon name={focused ? 'search' : 'search-outline'} size={20} color={focused ? '#fff' : 'grey'} />
                            <Text style={{ color: focused ? '#fff' : 'grey', fontFamily: 'Roboto-Bold', fontSize: 10 }}>Search</Text>
                        </View>
                    )
                }}
                name='Search'
                component={Search}
            />
            <Tab.Screen
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TouchableOpacity 
                            style={{ alignItems: 'center' }}
                            onPress={() => navigation.navigate('Stocks')}
                        >
                            <Icon name={focused ? 'bar-chart' : 'bar-chart-outline'} size={20} color={focused ? '#fff' : 'grey'} />
                            <Text style={{ color: focused ? '#fff' : 'grey', fontFamily: 'Roboto-Bold', fontSize: 10 }}>Stocks</Text>
                        </TouchableOpacity>
                    )
                }}
                name='StocksTab'
                component={View} // Empty component since we're handling navigation in the icon
            /> 
        </Tab.Navigator>
    )
}

export default Home

const styles = StyleSheet.create({
    shadow: {
        elevation: 5,
        shadowColor: '#000',
        backgroundColor: '#00003f',
        borderWidth: 1,
        borderColor: 'transparent'
    }
})