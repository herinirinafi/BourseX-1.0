import { ENDPOINTS } from '../config/api';
import { apiClient } from './apiClient';
import { Alert } from 'react-native';

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  current_price: number;
  volume: number;
  last_updated: string;
  price_history?: PriceHistory[];
}

export interface PriceHistory {
  id: number;
  price: number;
  timestamp: string;
}

export const fetchStocks = async (): Promise<Stock[]> => {
  try {
  return await apiClient.get(ENDPOINTS.STOCKS) as unknown as Stock[];
  } catch (error: any) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

export const fetchStockDetail = async (id: string | number): Promise<Stock> => {
  try {
  return await apiClient.get(ENDPOINTS.STOCK_DETAIL(id)) as unknown as Stock;
  } catch (error: any) {
    console.error(`Error fetching stock details for ID ${id}:`, error);
    throw error;
  }
};

export const fetchStockHistory = async (id: string | number): Promise<PriceHistory[]> => {
  try {
  return await apiClient.get(ENDPOINTS.STOCK_HISTORY(id)) as unknown as PriceHistory[];
  } catch (error: any) {
    console.error(`Error fetching history for stock ID ${id}:`, error);
    throw error;
  }
};

export const updateStockPrices = async (): Promise<Stock[]> => {
  try {
  return await apiClient.post(ENDPOINTS.UPDATE_PRICES, {}) as unknown as Stock[];
  } catch (error: any) {
    console.error('Error updating stock prices:', error);
    throw error;
  }
};

// Backward-compatible function used by hooks/components
export const updateStockPrice = async (id: string | number, price: number): Promise<Stock> => {
  try {
    // Backend does not support per-stock manual price update; trigger bulk update instead
    await updateStockPrices();
    // Then return the refreshed stock details
    return await fetchStockDetail(id);
  } catch (error: any) {
    console.error(`Error updating stock (simulated) for ID ${id}:`, error);
    throw error;
  }
};

export const showErrorAlert = (error: Error) => {
  Alert.alert(
    'Error',
    error.message || 'An unexpected error occurred',
    [{ text: 'OK' }],
    { cancelable: false }
  );
};

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    await apiClient.get(ENDPOINTS.DASHBOARD);
    return true;
  } catch (error) {
    console.error('Erreur de connexion au backend:', error);
    return false;
  }
};

// Portfolio and Transactions
export const fetchPortfolio = async () => {
  return apiClient.get(ENDPOINTS.PORTFOLIO);
};

export const fetchTransactions = async () => {
  return apiClient.get(ENDPOINTS.TRANSACTIONS);
};

export const executeTrade = async (
  stockRef: number | { symbol: string },
  trade_type: 'BUY' | 'SELL',
  quantity: number
) => {
  if (typeof stockRef === 'number') {
    return apiClient.post(ENDPOINTS.TRADE, { stock_id: stockRef, trade_type, quantity });
  }
  return apiClient.post(ENDPOINTS.TRADE, { symbol: stockRef.symbol, trade_type, quantity });
};

export const fetchDashboard = async () => {
  return apiClient.get(ENDPOINTS.DASHBOARD);
};

export const fetchMe = async () => {
  return apiClient.get('/me/');
};

// Missions
export const fetchMissions = async () => {
  return apiClient.get(ENDPOINTS.MISSIONS);
};