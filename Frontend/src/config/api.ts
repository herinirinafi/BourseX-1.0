// Configuration de l'environnement
const ENV = {
  DEV: 'development',
  PROD: 'production',
} as const;

type Environment = typeof ENV[keyof typeof ENV];

// Configuration des URLs de l'API
const API_URLS = {
  [ENV.DEV]: 'http://127.0.0.1:8000/api',  
  [ENV.PROD]: 'https://votre-api-production.com/api',
} as const;

// Configuration des timeouts (en millisecondes)
export const REQUEST_TIMEOUT = 15000; 
export const MAX_RETRIES = 2;

// Détection de l'environnement
const getEnvironment = (): Environment => {
  // Pour React Native, vous pouvez utiliser __DEV__
  return __DEV__ ? ENV.DEV : ENV.PROD;
};

// URL de base de l'API
export const API_BASE_URL = API_URLS[getEnvironment()];

// Points de terminaison de l'API
export const ENDPOINTS = {
  // Stocks
  STOCKS: '/stocks/',
  STOCK_DETAIL: (id: string | number) => `/stocks/${id}/`,
  STOCK_HISTORY: (id: string | number) => `/stocks/${id}/history/`,
  UPDATE_PRICES: `/stocks/update_prices/`,
  
  // Trading & Portfolio
  PORTFOLIO: '/portfolio/',
  TRANSACTIONS: '/transactions/',
  TRADE: '/trade/',
  DASHBOARD: '/dashboard/',
  
  // Authentification
  LOGIN: '/auth/login/',
  REFRESH_TOKEN: '/auth/refresh/',
  LOGOUT: '/auth/logout/',

  // Gamification
  GAMIFICATION_SUMMARY: '/gamification/',
  GAMIFICATION_UPDATE: '/gamification/update/',
  USER_BADGES: '/user-badges/',
  USER_ACHIEVEMENTS: '/user-achievements/',
  DAILY_STREAK: '/daily-streak/',

  // Leaderboard & Meta
  BADGES: '/badges/',
  LEADERBOARD: '/leaderboard/',
  ACHIEVEMENTS: '/achievements/',
  NOTIFICATIONS: '/notifications/',
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark_all_read/',

  // Watchlist & Missions
  WATCHLIST: '/watchlist/',
  MISSIONS: '/missions/',
} as const;

// En-têtes par défaut
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Fonction pour obtenir les en-têtes d'authentification
export const getAuthHeaders = (token: string | null) => {
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
  };
};

// Configuration du client HTTP
export const httpConfig = {
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: DEFAULT_HEADERS,
  maxRetries: MAX_RETRIES,
  retryDelay: 1000, // 1 seconde entre les tentatives
} as const;

// Types d'erreurs courantes
export const ERROR_CODES = {
  TIMEOUT: 'ECONNABORTED',
  NETWORK: 'ERR_NETWORK',
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// Messages d'erreur conviviaux
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'Session expirée. Veuillez vous reconnecter.',
  [ERROR_CODES.FORBIDDEN]: 'Accès refusé. Vous n\'avez pas les droits nécessaires.',
  [ERROR_CODES.NOT_FOUND]: 'Ressource non trouvée.',
  [ERROR_CODES.SERVER_ERROR]: 'Erreur serveur. Veuillez réessayer plus tard.',
  DEFAULT: 'Une erreur est survenue. Veuillez réessayer.',
} as const;
