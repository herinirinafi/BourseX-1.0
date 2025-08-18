import React from 'react';
import { EnhancedBottomTabBar } from './EnhancedBottomTabBar';
import { CompactBottomTabBar } from './CompactBottomTabBar';
import { isSmallMobile } from '../../utils/responsive';

export const SmartNavigationBar: React.FC = () => {
  // Use compact navigation for small mobile devices
  if (isSmallMobile) {
    return <CompactBottomTabBar />;
  }
  
  // Use enhanced navigation with dropdowns for medium+ devices
  return <EnhancedBottomTabBar />;
};

export default SmartNavigationBar;
