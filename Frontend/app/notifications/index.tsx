import React from 'react';
import NotificationsScreen from '../../src/screens/NotificationsScreen';
import { ResponsiveScreenWrapper } from '../../src/components/responsive/ResponsiveScreenWrapper';

export default function NotificationsPage() {
  return (
    <ResponsiveScreenWrapper showBottomTabs={true}>
      <NotificationsScreen />
    </ResponsiveScreenWrapper>
  );
}
