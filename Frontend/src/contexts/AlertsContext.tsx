import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export type AlertType = {
  id: string;
  stockId: number;
  stockSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
};

type AlertsContextType = {
  alerts: AlertType[];
  addAlert: (alert: Omit<AlertType, 'id' | 'createdAt'>) => Promise<void>;
  removeAlert: (alertId: string) => Promise<void>;
  toggleAlert: (alertId: string) => Promise<void>;
  getAlertsForStock: (stockId: number) => AlertType[];
};

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

const ALERTS_STORAGE_KEY = '@BourseX:alerts';

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      if (jsonValue !== null) {
        setAlerts(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load alerts', e);
    } finally {
      setLoading(false);
    }
  };

  const saveAlerts = async (newAlerts: AlertType[]) => {
    try {
      const jsonValue = JSON.stringify(newAlerts);
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, jsonValue);
      setAlerts(newAlerts);
    } catch (e) {
      console.error('Failed to save alerts', e);
    }
  };

  const addAlert = async (alert: Omit<AlertType, 'id' | 'createdAt'>) => {
    const newAlert: AlertType = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const newAlerts = [...alerts, newAlert];
    await saveAlerts(newAlerts);
  };

  const removeAlert = async (alertId: string) => {
    const newAlerts = alerts.filter(alert => alert.id !== alertId);
    await saveAlerts(newAlerts);
  };

  const toggleAlert = async (alertId: string) => {
    const newAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    );
    await saveAlerts(newAlerts);
  };

  const getAlertsForStock = (stockId: number) => {
    return alerts.filter(alert => alert.stockId === stockId);
  };

  // Check for triggered alerts
  const checkAlerts = (stockId: number, currentPrice: number) => {
    const relevantAlerts = alerts.filter(
      alert => 
        alert.stockId === stockId && 
        alert.isActive &&
        ((alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
         (alert.condition === 'below' && currentPrice <= alert.targetPrice))
    );

    relevantAlerts.forEach(alert => {
      Alert.alert(
        'Price Alert',
        `${alert.stockSymbol} is now ${alert.condition} ${alert.targetPrice}. Current price: ${currentPrice}`,
        [{ text: 'OK' }]
      );
      // Optionally deactivate the alert after triggering
      toggleAlert(alert.id);
    });
  };

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        toggleAlert,
        getAlertsForStock,
      }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};
