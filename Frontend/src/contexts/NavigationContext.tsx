import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeDropdown: string | null;
  setActiveDropdown: (dropdown: string | null) => void;
  navigationHistory: string[];
  addToHistory: (route: string) => void;
  goBack: () => string | null;
  clearHistory: () => void;
  isCompactMode: boolean;
  setCompactMode: (compact: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [isCompactMode, setCompactMode] = useState(false);

  const addToHistory = (route: string) => {
    setNavigationHistory(prev => {
      const filtered = prev.filter(r => r !== route);
      return [...filtered, route].slice(-10); // Keep last 10 routes
    });
  };

  const goBack = (): string | null => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current route
      const previousRoute = newHistory.pop(); // Get previous route
      setNavigationHistory(newHistory);
      return previousRoute || null;
    }
    return null;
  };

  const clearHistory = () => {
    setNavigationHistory([]);
  };

  const contextValue: NavigationContextType = {
    activeDropdown,
    setActiveDropdown,
    navigationHistory,
    addToHistory,
    goBack,
    clearHistory,
    isCompactMode,
    setCompactMode,
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationProvider;
