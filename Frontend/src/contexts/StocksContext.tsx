import React, { createContext, useContext, ReactNode } from 'react';
import { Stock, PriceHistory } from '../services/api';
import { useStocks } from '../hooks/useStocks';

interface StocksContextType {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  loadStocks: () => Promise<void>;
  getStockDetail: (id: string | number) => Promise<Stock>;
  getStockHistory: (id: string | number) => Promise<PriceHistory[]>;
  updateStockPrice: (id: string | number, price: number) => Promise<Stock>;
}

const StocksContext = createContext<StocksContextType | undefined>(undefined);

export const StocksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    stocks,
    loading,
    error,
    loadStocks,
    getStockDetail,
    getStockHistory,
    updateStockPrice,
  } = useStocks();

  return (
    <StocksContext.Provider
      value={{
        stocks,
        loading,
        error,
        loadStocks,
        getStockDetail,
        getStockHistory,
        updateStockPrice,
      }}
    >
      {children}
    </StocksContext.Provider>
  );
};

export const useStocksContext = (): StocksContextType => {
  const context = useContext(StocksContext);
  if (context === undefined) {
    throw new Error('useStocksContext must be used within a StocksProvider');
  }
  return context;
};
