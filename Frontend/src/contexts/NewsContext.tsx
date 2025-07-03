import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Note: In a real app, you would fetch this from a news API
type NewsArticle = {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: 'general' | 'business' | 'technology' | 'markets';
};

type NewsContextType = {
  news: NewsArticle[];
  loading: boolean;
  error: string | null;
  fetchNews: (category?: string) => Promise<void>;
  fetchStockNews: (symbol: string) => Promise<void>;
};

const NewsContext = createContext<NewsContextType | undefined>(undefined);

// Mock data - in a real app, replace with actual API calls
const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Stock Market Reaches All-Time High',
    description: 'Global markets surge as economic recovery exceeds expectations.',
    source: 'Financial Times',
    url: 'https://example.com/news/1',
    imageUrl: 'https://via.placeholder.com/300x200?text=Market+News',
    publishedAt: new Date().toISOString(),
    category: 'markets',
  },
  // Add more mock articles as needed
];

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (category: string = 'general') => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data by category
      const filteredNews = mockNews.filter(article => 
        category === 'all' ? true : article.category === category
      );
      
      setNews(filteredNews);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockNews = async (symbol: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, filter news related to the stock symbol
      const stockNews = mockNews.filter(article => 
        article.title.toLowerCase().includes(symbol.toLowerCase()) ||
        article.description.toLowerCase().includes(symbol.toLowerCase())
      );
      
      setNews(stockNews);
    } catch (err) {
      console.error(`Failed to fetch news for ${symbol}:`, err);
      setError(`Failed to load news for ${symbol}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Load initial news
  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <NewsContext.Provider
      value={{
        news,
        loading,
        error,
        fetchNews,
        fetchStockNews,
      }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
