import React, { createContext, useContext, useState, useEffect } from 'react';
import { Asset, User, Transaction, Mission, MarketEvent } from '../types';
import { fetchStocks, executeTrade as executeTradeApi } from '../services/api';

interface TradingContextType {
  user: User;
  assets: Asset[];
  transactions: Transaction[];
  missions: Mission[];
  marketEvents: MarketEvent[];
  buyAsset: (assetId: string, amount: number) => Promise<void>;
  sellAsset: (assetId: string, amount: number) => Promise<void>;
  completeMission: (missionId: string) => void;
  fetchMarketData: () => Promise<void>;
  loading: boolean;
  error?: string | null;
}

const defaultUser: User = {
  id: '1',
  name: 'Trader',
  balance: 10000,
  portfolio: [],
  badges: ['newbie'],
  level: 1,
  xp: 0,
};

const defaultContext: TradingContextType = {
  user: defaultUser,
  assets: [],
  transactions: [],
  missions: [],
  marketEvents: [],
  buyAsset: async () => {},
  sellAsset: async () => {},
  completeMission: () => {},
  fetchMarketData: async () => {},
  loading: false,
  error: null,
};

const TradingContext = createContext<TradingContextType>(defaultContext);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
    // Simuler des mises à jour de marché toutes les 30 secondes
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    await fetchMarketData();
    await loadMissions();
    await loadMarketEvents();
  };

  const mapBackendStocksToAssets = (stocks: any[]): Asset[] => {
    return stocks.map(s => ({
      id: String(s.id ?? s.symbol),
      symbol: s.symbol,
      name: s.name,
      currentPrice: Number(s.current_price ?? s.currentPrice ?? 0),
      change24h: 0,
      image: 'https://dummyimage.com/64x64/0ea5e9/ffffff&text=' + (s.symbol || 'AS'),
    }));
  };

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stocks = await fetchStocks();
      setAssets(mapBackendStocksToAssets(stocks));
  } catch (e: any) {
      // Fallback to mock if backend unreachable
      const mockAssets: Asset[] = [
        {
          id: 'BTC',
          symbol: 'BTC',
          name: 'Bitcoin',
          currentPrice: Math.random() * 10000 + 30000,
          change24h: Math.random() * 10 - 5,
          image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        },
      ];
      setAssets(mockAssets);
      setError(e?.message || 'Impossible de charger les données marché');
    } finally {
      setLoading(false);
    }
  };

  const loadMissions = async () => {
    const dailyMissions: Mission[] = [
      {
        id: 'm1',
        title: 'Premier achat',
        description: 'Effectuez votre premier achat',
        reward: 100,
        completed: false,
        progress: 0,
        target: 1,
        type: 'daily',
      },
      // Ajouter d'autres missions
    ];
    setMissions(dailyMissions);
  };

  const loadMarketEvents = async () => {
    // Simuler des événements de marché
    const events: MarketEvent[] = [
      {
        id: 'e1',
        title: 'Bull Run',
        description: 'Le marché est en forte hausse aujourd\'hui !',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        marketEffect: 'bull',
        intensity: 4,
      },
    ];
    setMarketEvents(events);
  };

  const buyAsset = async (assetId: string, amount: number) => {
    // Implémenter la logique d'achat
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const totalCost = asset.currentPrice * amount;
    if (user.balance < totalCost) return;

    // Mettre à jour le solde de l'utilisateur
    const updatedUser = {
      ...user,
      balance: user.balance - totalCost,
      portfolio: [...user.portfolio],
    };

    // Mettre à jour le portefeuille
    const portfolioItem = updatedUser.portfolio.find(item => item.assetId === assetId);
    if (portfolioItem) {
      const totalQuantity = portfolioItem.quantity + amount;
      const totalCost = portfolioItem.avgBuyPrice * portfolioItem.quantity + asset.currentPrice * amount;
      portfolioItem.quantity = totalQuantity;
      portfolioItem.avgBuyPrice = totalCost / totalQuantity;
    } else {
      updatedUser.portfolio.push({
        assetId,
        quantity: amount,
        avgBuyPrice: asset.currentPrice,
      });
    }

    // Ajouter la transaction
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      assetId,
      type: 'buy',
      quantity: amount,
      price: asset.currentPrice,
      timestamp: new Date(),
    };

    try {
      // Attempt backend trade if possible (requires numeric stock id). Using symbol fallback
      const backendStock = assets.find(a => a.id === assetId || a.symbol === assetId);
      if (backendStock) {
        const numericId = Number(backendStock.id);
        if (!Number.isNaN(numericId)) {
          await executeTradeApi(numericId, 'BUY', amount);
        }
      }
  } catch {
      // Ignore backend errors for now, local state already updated
    }

    setUser(updatedUser);
    setTransactions([newTransaction, ...transactions]);
  };

  const sellAsset = async (assetId: string, amount: number) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const portfolioItem = user.portfolio.find(p => p.assetId === assetId);
    if (!portfolioItem || portfolioItem.quantity < amount) return;

    const revenue = asset.currentPrice * amount;

    const updatedUser = {
      ...user,
      balance: user.balance + revenue,
      portfolio: user.portfolio
        .map(p => p.assetId === assetId ? { ...p, quantity: p.quantity - amount } : p)
        .filter(p => p.quantity > 0),
    };

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      assetId,
      type: 'sell',
      quantity: amount,
      price: asset.currentPrice,
      timestamp: new Date(),
    };

    try {
      const backendStock = assets.find(a => a.id === assetId || a.symbol === assetId);
      const numericId = backendStock ? Number(backendStock.id) : NaN;
      if (!Number.isNaN(numericId)) {
        await executeTradeApi(numericId, 'SELL', amount);
      }
    } catch {
      // ignore backend errors; local state already updated
    }

    setUser(updatedUser);
    setTransactions([newTransaction, ...transactions]);
  };

  const completeMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    const updatedMissions = missions.map(m => 
      m.id === missionId 
        ? { ...m, completed: true, progress: m.target }
        : m
    );

    // Ajouter la récompense
    const updatedUser = {
      ...user,
      balance: user.balance + mission.reward,
      xp: user.xp + 10, // 10 XP par mission
    };

    // Vérifier le niveau
    const xpForNextLevel = updatedUser.level * 100;
    if (updatedUser.xp >= xpForNextLevel) {
      updatedUser.level += 1;
      updatedUser.xp = 0;
      // Débloquer un badge tous les 5 niveaux
      if (updatedUser.level % 5 === 0) {
        updatedUser.badges.push(`niveau-${updatedUser.level}`);
      }
    }

    setMissions(updatedMissions);
    setUser(updatedUser);
  };

  return (
    <TradingContext.Provider
      value={{
        user,
        assets,
        transactions,
        missions,
        marketEvents,
        buyAsset,
        sellAsset,
        completeMission,
        fetchMarketData,
  loading,
  error,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);
