import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stock } from '../services/api';

export type PortfolioItem = {
  stock: Stock;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  lastUpdated: string;
};

type PortfolioContextType = {
  portfolio: PortfolioItem[];
  addToPortfolio: (stock: Stock, quantity: number, price: number) => Promise<void>;
  removeFromPortfolio: (stockId: number, quantity: number) => Promise<void>;
  getPortfolioItem: (stockId: number) => PortfolioItem | undefined;
  getPortfolioValue: () => number;
  getPortfolioPerformance: () => { totalValue: number; totalInvested: number; profitLoss: number; profitLossPercentage: number };
  loading: boolean;
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const PORTFOLIO_STORAGE_KEY = '@BourseX:portfolio';

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (jsonValue !== null) {
        setPortfolio(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load portfolio', e);
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async (newPortfolio: PortfolioItem[]) => {
    try {
      const jsonValue = JSON.stringify(newPortfolio);
      await AsyncStorage.setItem(PORTFOLIO_STORAGE_KEY, jsonValue);
      setPortfolio(newPortfolio);
    } catch (e) {
      console.error('Failed to save portfolio', e);
    }
  };

  const addToPortfolio = async (stock: Stock, quantity: number, price: number) => {
    const existingItemIndex = portfolio.findIndex(item => item.stock.id === stock.id);
    let newPortfolio = [...portfolio];
    
    if (existingItemIndex >= 0) {
      // Update existing portfolio item
      const existingItem = newPortfolio[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      const newTotalInvested = existingItem.totalInvested + (quantity * price);
      const newAveragePrice = newTotalInvested / newQuantity;
      
      newPortfolio[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        averagePrice: newAveragePrice,
        totalInvested: newTotalInvested,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // Add new portfolio item
      newPortfolio.push({
        stock: { ...stock },
        quantity,
        averagePrice: price,
        totalInvested: quantity * price,
        lastUpdated: new Date().toISOString(),
      });
    }
    
    await savePortfolio(newPortfolio);
  };

  const removeFromPortfolio = async (stockId: number, quantity: number) => {
    const existingItemIndex = portfolio.findIndex(item => item.stock.id === stockId);
    
    if (existingItemIndex >= 0) {
      const existingItem = portfolio[existingItemIndex];
      
      if (existingItem.quantity <= quantity) {
        // Remove the item completely
        const newPortfolio = portfolio.filter(item => item.stock.id !== stockId);
        await savePortfolio(newPortfolio);
      } else {
        // Update quantity
        const newPortfolio = [...portfolio];
        const remainingQuantity = existingItem.quantity - quantity;
        const remainingValue = (remainingQuantity / existingItem.quantity) * existingItem.totalInvested;
        
        newPortfolio[existingItemIndex] = {
          ...existingItem,
          quantity: remainingQuantity,
          totalInvested: remainingValue,
          lastUpdated: new Date().toISOString(),
        };
        
        await savePortfolio(newPortfolio);
      }
    }
  };

  const getPortfolioItem = (stockId: number) => {
    return portfolio.find(item => item.stock.id === stockId);
  };

  const getPortfolioValue = useCallback(() => {
    return portfolio.reduce((total, item) => {
      return total + (item.stock.current_price * item.quantity);
    }, 0);
  }, [portfolio]);

  const getPortfolioPerformance = useCallback(() => {
    const totalValue = getPortfolioValue();
    const totalInvested = portfolio.reduce((total, item) => total + item.totalInvested, 0);
    const profitLoss = totalValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
    
    return {
      totalValue,
      totalInvested,
      profitLoss,
      profitLossPercentage,
    };
  }, [portfolio, getPortfolioValue]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        addToPortfolio,
        removeFromPortfolio,
        getPortfolioItem,
        getPortfolioValue,
        getPortfolioPerformance,
        loading,
      }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
