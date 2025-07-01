import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Welcome = ({ navigation }) => {
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
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

            <LinearGradient
                colors={['#2D97DA', '#2249D6']} style={{ flex: 1 }} >

                <View style={{ flex: 2.5, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Image resizeMode='contain'
                        style={{ width: wp('90%'), height: hp('90%') }}
                        source={require('../assets/images/crypto_bank.png')} />
                </View>


                {/* bottom  */}
                <View style={{ flex: 2, justifyContent: 'center', paddingHorizontal: wp('5%') }}>
                    <View style={{
                        position: 'relative',
                        flexDirection: 'column',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        height: hp('34%'),
                        borderRadius: 15,
                        paddingTop: 20,
                        paddingHorizontal: wp('5%'),

                    }}>

                        <Text style={{
                            fontFamily: 'Roboto-Black',
                            fontSize: 25,
                            color: '#fff',
                            alignSelf: 'center',
                            textAlign: 'center'
                        }}>Buy Bitcoin and Trade Top Cryptocurrence</Text>
                        <Text
                            style={{
                                fontSize: 15,
                                fontFamily: 'Roboto-Regular',
                                alignSelf: 'center',
                                paddingTop: 20,
                                color: '#d8d8d8',
                                textAlign: 'center'
                            }}
                        >you can trade and buy and sell srypto coins here very easily and reliably</Text>

                        <TouchableOpacity onPress={() => navigation.navigate('Home')}
                            style={{
                                position: 'relative',
                                width: '100%',
                                backgroundColor: '#fff',
                                height: 50,
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 30
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: 'Roboto-Bold',
                                    fontSize: 15,
                                    color: '#2d97da'
                                }}
                            >Get Started!</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </LinearGradient>


        </View>
    )
}

export default Welcome

const styles = StyleSheet.create({

})