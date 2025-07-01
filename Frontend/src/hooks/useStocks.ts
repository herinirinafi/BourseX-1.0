import { useState, useEffect, useCallback } from 'react';
import { Stock, PriceHistory, fetchStocks, fetchStockDetail, fetchStockHistory, updateStockPrice as updateStockPriceApi } from '../services/api';

export const useStocks = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStocks();
      setStocks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch stocks');
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockDetail = useCallback(async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchStockDetail(id);
    } catch (err) {
      setError(err.message || 'Failed to fetch stock details');
      console.error('Error fetching stock details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockHistory = useCallback(async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchStockHistory(id);
    } catch (err) {
      setError(err.message || 'Failed to fetch stock history');
      console.error('Error fetching stock history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStockPrice = useCallback(async (id: string | number, price: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStock = await updateStockPriceApi(id, price);
      
      // Update the stock in the stocks list
      setStocks(prevStocks => 
        prevStocks.map(stock => 
          stock.id === updatedStock.id ? updatedStock : stock
        )
      );
      
      return updatedStock;
    } catch (err) {
      setError(err.message || 'Failed to update stock price');
      console.error('Error updating stock price:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  return {
    stocks,
    loading,
    error,
    loadStocks,
    getStockDetail,
    getStockHistory,
    updateStockPrice,
  };
};
