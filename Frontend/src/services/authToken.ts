import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

let currentToken: string | null = null;
let currentRefreshToken: string | null = null;

// Auth Token Management
export const setAuthToken = async (token: string | null): Promise<void> => {
  currentToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = (): string | null => {
  return currentToken;
};

export const setRefreshToken = async (token: string | null): Promise<void> => {
  currentRefreshToken = token;
  if (token) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const getRefreshToken = (): string | null => {
  return currentRefreshToken;
};

export const loadTokensFromStorage = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    
    currentToken = token;
    currentRefreshToken = refreshToken;
  } catch (error) {
    console.error('Error loading tokens from storage:', error);
    currentToken = null;
    currentRefreshToken = null;
  }
};

export const clearAllTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
    ]);
    currentToken = null;
    currentRefreshToken = null;
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};