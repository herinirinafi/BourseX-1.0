// API Configuration
export const API_BASE_URL = 'http://10.0.2.2:8000/api';  // For Android emulator
// export const API_BASE_URL = 'http://localhost:8000/api';  // For iOS simulator or physical device

export const ENDPOINTS = {
  STOCKS: '/stocks/',
  STOCK_DETAIL: (id: string | number) => `/stocks/${id}/`,
  STOCK_HISTORY: (id: string | number) => `/stocks/${id}/history/`,
  UPDATE_PRICE: (id: string | number) => `/stocks/${id}/update_price/`,
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
