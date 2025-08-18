import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { useGamification } from '../contexts/GamificationContext';
import { dummyData } from '../constants';
import { ProfitIndicator, ActionCenter } from '../components';
import { 
  ResponsiveContainer,
  ResponsiveScrollView,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveRow
} from '../components/responsive/ResponsiveLayouts';
import { 
  ResponsiveText,
  ResponsiveHeading,
  ResponsiveButton
} from '../components/responsive/ResponsiveText';
import { 
  isDesktop, 
  isTablet, 
  spacing, 
  borderRadius, 
  fontSize,
  wp,
  hp 
} from '../utils/responsive';

const ResponsiveDashboard = () => {
  const navigation = useNavigation();
  const { userBadges, unreadCount, userProfile } = useGamification();
  
  const [loaded, error] = useFonts({
    'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Regular-Italic': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const renderHeader = () => (
    <LinearGradient 
      start={{ x: 0.0, y: 0.4 }} 
      end={{ x: 0.5, y: 1.0 }} 
      colors={['#2D97DA', '#2249D6']} 
      style={{
        padding: spacing.lg,
        paddingTop: isDesktop ? spacing.lg : spacing.xl * 2,
        borderBottomLeftRadius: isDesktop ? 0 : borderRadius.xl,
        borderBottomRightRadius: isDesktop ? 0 : borderRadius.xl,
      }}
    >
      {/* Header Row */}
      <ResponsiveRow justifyContent="space-between" alignItems="flex-start">
        <View>
          <ResponsiveText size="base" color="#fff">
            Welcome Back
          </ResponsiveText>
          <ResponsiveText size="xl" color="#fff" weight="medium">
            German
          </ResponsiveText>
        </View>

        <ResponsiveRow alignItems="center" gap={spacing.md}>
          <Icon name="bell" size={isDesktop ? 32 : 30} color="#fff" />
          <Image 
            source={require('../assets/images/avatar.jpg')} 
            style={{
              width: isDesktop ? 48 : 40,
              height: isDesktop ? 48 : 40,
              borderRadius: isDesktop ? 24 : 20,
            }} 
          />
        </ResponsiveRow>
      </ResponsiveRow>

      {/* Balance Section */}
      <View style={{ marginTop: spacing.lg }}>
        <ResponsiveText size="sm" color="rgba(255,255,255,0.8)">
          Total Amount
        </ResponsiveText>
        <ResponsiveText size="4xl" color="#fff" weight="bold">
          $25,000.00
        </ResponsiveText>
        
        <ResponsiveRow justifyContent="space-between" alignItems="center" style={{ marginTop: spacing.md }}>
          <ResponsiveText size="sm" color="rgba(255,255,255,0.8)">
            +2.8% this week
          </ResponsiveText>
          <ResponsiveButton
            title="Show Rewards"
            onPress={() => {}}
            variant="outline"
            size="sm"
            textStyle={{ color: '#fff' }}
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}
          />
        </ResponsiveRow>
      </View>
    </LinearGradient>
  );

  const renderActionButtons = () => (
    <ResponsiveCard 
      style={{
        marginTop: isDesktop ? spacing.lg : -spacing.lg,
        marginHorizontal: spacing.md,
        elevation: 10,
        shadowColor: '#000',
        shadowRadius: 10,
        backgroundColor: '#fff',
      }}
    >
      <ResponsiveRow justifyContent="space-around" alignItems="center">
        <ActionCenter img_src={require('../assets/icons/top-up.png')} img_text="Top-Up" />
        <ActionCenter img_src={require('../assets/icons/buy.png')} img_text="Buy" />
        <ActionCenter img_src={require('../assets/icons/withdraw.png')} img_text="WithDraw" />
      </ResponsiveRow>
    </ResponsiveCard>
  );

  const renderGamificationSection = () => (
    <ResponsiveCard style={{ margin: spacing.md, backgroundColor: '#f8f9fa' }}>
      <ResponsiveRow justifyContent="space-around" alignItems="center">
        <TouchableOpacity 
          style={{ alignItems: 'center', flex: 1 }}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <View style={{
            backgroundColor: '#17a2b8',
            width: isDesktop ? 50 : 40,
            height: isDesktop ? 50 : 40,
            borderRadius: isDesktop ? 25 : 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ResponsiveText size="lg">🏆</ResponsiveText>
          </View>
          <ResponsiveText size="xs" weight="bold" color="#333" style={{ marginTop: spacing.xs }}>
            Classement
          </ResponsiveText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ alignItems: 'center', flex: 1 }}
          onPress={() => navigation.navigate('Missions')}
        >
          <View style={{
            backgroundColor: '#28a745',
            width: isDesktop ? 50 : 40,
            height: isDesktop ? 50 : 40,
            borderRadius: isDesktop ? 25 : 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ResponsiveText size="lg">🎯</ResponsiveText>
          </View>
          <ResponsiveText size="xs" weight="bold" color="#333" style={{ marginTop: spacing.xs }}>
            Missions
          </ResponsiveText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{ alignItems: 'center', flex: 1 }}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={{
            backgroundColor: '#dc3545',
            width: isDesktop ? 50 : 40,
            height: isDesktop ? 50 : 40,
            borderRadius: isDesktop ? 25 : 20,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <ResponsiveText size="lg">🔔</ResponsiveText>
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: '#ff4444',
                borderRadius: 10,
                width: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ResponsiveText size="xs" color="#fff" weight="bold">
                  {unreadCount}
                </ResponsiveText>
              </View>
            )}
          </View>
          <ResponsiveText size="xs" weight="bold" color="#333" style={{ marginTop: spacing.xs }}>
            Alertes
          </ResponsiveText>
        </TouchableOpacity>
      </ResponsiveRow>
    </ResponsiveCard>
  );

  const renderAssetSection = () => (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: spacing.md }}>
      <ResponsiveRow justifyContent="space-between" style={{ marginTop: spacing.md }}>
        <ResponsiveHeading level={3} color="#333">
          My Assets
        </ResponsiveHeading>
        <TouchableOpacity onPress={() => console.log('see all')}>
          <ResponsiveText size="lg" color="#2249DA" weight="medium">
            See All
          </ResponsiveText>
        </TouchableOpacity>
      </ResponsiveRow>

      {/* Asset Cards */}
      {isDesktop ? (
        <ResponsiveGrid columns={3} gap={spacing.md} style={{ marginTop: spacing.md }}>
          {dummyData.coins.slice(0, 6).map((item) => (
            <ResponsiveCard key={item.id} style={{ borderColor: '#ddd', borderWidth: 1 }}>
              {renderAssetCard(item)}
            </ResponsiveCard>
          ))}
        </ResponsiveGrid>
      ) : (
        <FlatList
          horizontal
          keyExtractor={(item) => item.id}
          data={dummyData.coins}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: spacing.md }}
          renderItem={({ item }) => (
            <ResponsiveCard 
              style={{
                width: wp(65),
                height: hp(20),
                marginRight: spacing.sm,
                borderColor: '#ddd',
                borderWidth: 1,
              }}
            >
              {renderAssetCard(item)}
            </ResponsiveCard>
          )}
        />
      )}
    </View>
  );

  const renderAssetCard = (item) => (
    <View style={{ flex: 1, padding: spacing.sm }}>
      <ResponsiveRow alignItems="center" style={{ marginBottom: spacing.sm }}>
        <Image style={{ height: 30, width: 30 }} resizeMode="contain" source={item.image} />
        <View style={{ marginLeft: spacing.sm }}>
          <ResponsiveText size="base" weight="medium" color="#333">
            {item.currency}
          </ResponsiveText>
          <ResponsiveText size="sm" color="#666">
            BNB/USDT
          </ResponsiveText>
        </View>
      </ResponsiveRow>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <ResponsiveText size="sm" weight="medium" color="#333">
          ${item.amount}
        </ResponsiveText>
        <ResponsiveRow alignItems="center">
          <ResponsiveText 
            size="xs" 
            weight="bold" 
            color={item.type === "I" ? 'green' : 'red'}
          >
            {item.changes}
          </ResponsiveText>
          <Icon 
            name={item.type === "I" ? 'chevron-circle-up' : 'chevron-circle-down'} 
            color={item.type === "I" ? 'green' : 'red'} 
            size={12}
            style={{ marginLeft: spacing.xs }}
          />
        </ResponsiveRow>
      </View>
    </View>
  );

  const renderMarketSection = () => (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: spacing.md }}>
      <ResponsiveHeading level={3} color="#333" style={{ marginVertical: spacing.md }}>
        Market
      </ResponsiveHeading>

      {dummyData.coins.map((item) => (
        <ResponsiveCard 
          key={item.id}
          style={{
            borderColor: '#ddd',
            borderWidth: 1,
            marginBottom: spacing.sm,
            backgroundColor: '#fff',
          }}
        >
          <ResponsiveRow justifyContent="space-between" alignItems="center">
            <ResponsiveRow alignItems="center">
              <Image style={{ height: 40, width: 40 }} resizeMode="contain" source={item.image} />
              <View style={{ marginLeft: spacing.md }}>
                <ResponsiveText size="lg" weight="medium" color="#333">
                  {item.currency}
                </ResponsiveText>
                <ResponsiveText size="sm" color="#666">
                  BNB/USDT
                </ResponsiveText>
              </View>
            </ResponsiveRow>

            <View style={{ alignItems: 'flex-end' }}>
              <ResponsiveText size="sm" weight="medium" color="#333">
                ${item.amount}
              </ResponsiveText>
              <ResponsiveRow alignItems="center">
                <ResponsiveText 
                  size="xs" 
                  weight="bold" 
                  color={item.type === "I" ? 'green' : 'red'}
                >
                  {item.changes}
                </ResponsiveText>
                <Icon 
                  name={item.type === "I" ? 'chevron-circle-up' : 'chevron-circle-down'} 
                  color={item.type === "I" ? 'green' : 'red'} 
                  size={12}
                  style={{ marginLeft: spacing.xs }}
                />
              </ResponsiveRow>
            </View>
          </ResponsiveRow>
        </ResponsiveCard>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      
      {isDesktop ? (
        <ResponsiveContainer style={{ flex: 1, maxWidth: 1200 }}>
          <ResponsiveScrollView>
            {renderHeader()}
            
            <ResponsiveRow style={{ marginTop: spacing.lg }}>
              <View style={{ flex: 1, marginRight: spacing.lg }}>
                {renderActionButtons()}
                {renderGamificationSection()}
                {renderAssetSection()}
              </View>
              
              <View style={{ flex: 1 }}>
                {renderMarketSection()}
              </View>
            </ResponsiveRow>
          </ResponsiveScrollView>
        </ResponsiveContainer>
      ) : (
        <ResponsiveScrollView showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderActionButtons()}
          {renderGamificationSection()}
          {renderAssetSection()}
          {renderMarketSection()}
        </ResponsiveScrollView>
      )}
    </View>
  );
};

export default ResponsiveDashboard;
