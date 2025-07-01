import React, { createContext, useContext, useState, useEffect } from 'react';
import { Asset, User, Transaction, Mission, MarketEvent } from '../types';

interface TradingContextType {
  user: User;
  assets: Asset[];
  transactions: Transaction[];
  missions: Mission[];
  marketEvents: MarketEvent[];
  buyAsset: (assetId: string, amount: number) => void;
  sellAsset: (assetId: string, amount: number) => void;
  completeMission: (missionId: string) => void;
  fetchMarketData: () => Promise<void>;
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
  buyAsset: () => {},
  sellAsset: () => {},
  completeMission: () => {},
  fetchMarketData: async () => {},
};

const TradingContext = createContext<TradingContextType>(defaultContext);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
    // Simuler des mises à jour de marché toutes les 30 secondes
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    await fetchMarketData();
    await loadMissions();
    await loadMarketEvents();
  };

  const fetchMarketData = async () => {
    // Simuler des données de marché
    const mockAssets: Asset[] = [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        currentPrice: Math.random() * 10000 + 30000, // Prix aléatoire entre 30k et 40k
        change24h: Math.random() * 10 - 5, // Variation aléatoire entre -5% et +5%
        image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      },
      // Ajouter d'autres actifs ici
    ];
    setAssets(mockAssets);
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

  const buyAsset = (assetId: string, amount: number) => {
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

    setUser(updatedUser);
    setTransactions([newTransaction, ...transactions]);
  };

  const sellAsset = (assetId: string, amount: number) => {
    // Implémenter la logique de vente (similaire à buyAsset)
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
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);
