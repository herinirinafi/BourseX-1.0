import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { View } from 'react-native';
import { Typography } from '../src/components/ui';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Handle navigation after loading is complete
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFBFC' }}>
        <Typography variant="body1">Loading...</Typography>
      </View>
    );
  }

  // Return null while navigation is happening
  return null;
}