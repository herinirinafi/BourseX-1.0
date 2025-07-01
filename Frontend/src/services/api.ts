import { API_BASE_URL, ENDPOINTS, DEFAULT_HEADERS } from '../config/api';

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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const fetchStocks = async (): Promise<Stock[]> => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.STOCKS}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(response);
};

export const fetchStockDetail = async (id: string | number): Promise<Stock> => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.STOCK_DETAIL(id)}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(response);
};

export const fetchStockHistory = async (id: string | number): Promise<PriceHistory[]> => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.STOCK_HISTORY(id)}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
  });
  return handleResponse(response);
};

export const updateStockPrice = async (id: string | number, price: number): Promise<Stock> => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE_PRICE(id)}`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ price }),
  });
  return handleResponse(response);
};
