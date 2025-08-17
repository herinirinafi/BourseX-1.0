import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationsScreen from '../../src/screens/NotificationsScreen';
import { BottomTabBar } from '../../src/components/navigation/BottomTabBar';

export default function NotificationsPage() {
  return (
    <LinearGradient colors={['#F8FAFC', '#F1F5F9', '#E2E8F0']} style={styles.container}>
      <NotificationsScreen />
      <BottomTabBar />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
