import { useState, useEffect, useCallback } from 'react';
import { 
  Stock, 
  PriceHistory, 
  fetchStocks, 
  fetchStockDetail, 
  fetchStockHistory, 
  updateStockPrice as updateStockPriceApi,
  showErrorAlert 
} from '../services/api';

type UseStocksResult = {
  stocks: Stock[];
  loading: boolean;
  error: string | null;
  loadStocks: () => Promise<void>;
  getStockDetail: (id: string | number) => Promise<Stock>;
  getStockHistory: (id: string | number) => Promise<PriceHistory[]>;
  updateStockPrice: (id: string | number, price: number) => Promise<Stock>;
};

export const useStocks = (): UseStocksResult => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStocks();
      setStocks(data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch stocks';
      setError(errorMessage);
      showErrorAlert(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockDetail = useCallback(async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      return await fetchStockDetail(id);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch stock details';
      setError(errorMessage);
      showErrorAlert(new Error(errorMessage));
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
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch stock history';
      setError(errorMessage);
      showErrorAlert(new Error(errorMessage));
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
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update stock price';
      setError(errorMessage);
      showErrorAlert(new Error(errorMessage));
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
