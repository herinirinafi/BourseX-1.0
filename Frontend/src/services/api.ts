import { API_BASE_URL, ENDPOINTS, DEFAULT_HEADERS, REQUEST_TIMEOUT } from '../config/api.js';
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

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`
    }));
    const errorMessage = errorData.detail || errorData.message || 'Something went wrong';
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }
  return response.json();
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    throw error;
  }
};

export const fetchStocks = async (): Promise<Stock[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ENDPOINTS.STOCKS}`,
      {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      }
    );
    return handleResponse(response);
  } catch (error: any) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

export const fetchStockDetail = async (id: string | number): Promise<Stock> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ENDPOINTS.STOCK_DETAIL(id)}`,
      {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      }
    );
    return handleResponse(response);
  } catch (error: any) {
    console.error(`Error fetching stock details for ID ${id}:`, error);
    throw error;
  }
};

export const fetchStockHistory = async (id: string | number): Promise<PriceHistory[]> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ENDPOINTS.STOCK_HISTORY(id)}`,
      {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      }
    );
    return handleResponse(response);
  } catch (error: any) {
    console.error(`Error fetching history for stock ID ${id}:`, error);
    throw error;
  }
};

export const updateStockPrice = async (id: string | number, price: number): Promise<Stock> => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}${ENDPOINTS.UPDATE_PRICE(id)}`,
      {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ price }),
      }
    );
    return handleResponse(response);
  } catch (error: any) {
    console.error(`Error updating price for stock ID ${id}:`, error);
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
    const response = await fetch(`${API_BASE_URL}/health/`);
    return response.ok;
  } catch (error) {
    console.error('Erreur de connexion au backend:', error);
    return false;
  }
};