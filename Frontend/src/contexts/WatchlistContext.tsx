import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stock } from '../services/api';

type WatchlistContextType = {
  watchlist: Stock[];
  addToWatchlist: (stock: Stock) => Promise<void>;
  removeFromWatchlist: (stockId: number) => Promise<void>;
  isInWatchlist: (stockId: number) => boolean;
  loading: boolean;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const WATCHLIST_STORAGE_KEY = '@BourseX:watchlist';

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (jsonValue !== null) {
        setWatchlist(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load watchlist', e);
    } finally {
      setLoading(false);
    }
  };

  const saveWatchlist = async (newWatchlist: Stock[]) => {
    try {
      const jsonValue = JSON.stringify(newWatchlist);
      await AsyncStorage.setItem(WATCHLIST_STORAGE_KEY, jsonValue);
      setWatchlist(newWatchlist);
    } catch (e) {
      console.error('Failed to save watchlist', e);
    }
  };

  const addToWatchlist = async (stock: Stock) => {
    if (!isInWatchlist(stock.id)) {
      const newWatchlist = [...watchlist, stock];
      await saveWatchlist(newWatchlist);
    }
  };

  const removeFromWatchlist = async (stockId: number) => {
    const newWatchlist = watchlist.filter(stock => stock.id !== stockId);
    await saveWatchlist(newWatchlist);
  };

  const isInWatchlist = (stockId: number) => {
    return watchlist.some(stock => stock.id === stockId);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        loading,
      }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
