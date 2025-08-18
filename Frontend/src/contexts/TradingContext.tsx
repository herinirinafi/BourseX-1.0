import React, { createContext, useContext, useState, useEffect } from 'react';
import { Asset, User, Transaction, Mission, MarketEvent } from '../types';
import { fetchStocks, executeTrade as executeTradeApi, fetchTransactions as fetchTransactionsApi, fetchPortfolio, fetchMe } from '../services/api';
import { getAuthToken } from '../services/authToken';
import { useAuth } from './AuthContext';

interface TradingContextType {
  user: User;
  assets: Asset[];
  transactions: Transaction[];
  missions: Mission[];
  marketEvents: MarketEvent[];
  buyAsset: (assetId: string, amount: number) => Promise<{ serverSaved: boolean; localOnly: boolean }>;
  sellAsset: (assetId: string, amount: number) => Promise<{ serverSaved: boolean; localOnly: boolean }>;
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
  buyAsset: async () => ({ serverSaved: false, localOnly: true }),
  sellAsset: async () => ({ serverSaved: false, localOnly: true }),
  completeMission: () => {},
  fetchMarketData: async () => {},
  loading: false,
  error: null,
};

const TradingContext = createContext<TradingContextType>(defaultContext);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
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

  // Hydrate user portfolio/transactions/balance once authenticated
  useEffect(() => {
    const t = token || getAuthToken();
    if (!t || !isAuthenticated) return;
    (async () => {
      try {
        const me: any = await fetchMe();
        if (me && typeof me === 'object') {
          console.log('fetchMe response:', me); // Debug log
          const bal = Number(me?.profile?.balance ?? defaultUser.balance);
          const mappedPortfolio = (me?.portfolio ?? []).map((p: any) => ({
            assetId: String(p?.stock?.id ?? p?.stock_id ?? p?.stock?.symbol ?? ''),
            quantity: Number(p?.quantity ?? 0),
            avgBuyPrice: Number(p?.average_price ?? 0),
            currentValue: Number(p?.current_value ?? 0), // Add current value from backend
            currentPrice: Number(p?.stock?.current_price ?? 0), // Add current price
          }));
          console.log('Mapped portfolio:', mappedPortfolio); // Debug log
          const mappedTxs: Transaction[] = (me?.transactions ?? []).map((t: any) => ({
            id: String(t.id),
            assetId: String(t?.stock?.id ?? t?.stock_id ?? t?.symbol ?? ''),
            type: String(t?.transaction_type || t?.type || '').toLowerCase() === 'sell' ? 'sell' : 'buy',
            quantity: Number(t?.quantity ?? 0),
            price: Number(t?.price ?? 0),
            timestamp: new Date(t?.timestamp || t?.created_at || Date.now()),
          }));
          setUser(prev => ({ ...prev, balance: bal, portfolio: mappedPortfolio }));
          if (mappedTxs.length) setTransactions(mappedTxs);
        }
      } catch {}
    })();
  }, [token, isAuthenticated]);

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

  const buyAsset = async (assetId: string, amount: number): Promise<{ serverSaved: boolean; localOnly: boolean }> => {
    // Implémenter la logique d'achat (backend-first)
    const asset = assets.find(a => a.id === assetId);
    if (!asset) throw new Error('Actif introuvable');

    const totalCost = asset.currentPrice * amount;
    if (user.balance < totalCost) throw new Error('Solde insuffisant');

    // 1) Tenter le trade côté backend en premier (si id numérique)
  const backendStock = assets.find(a => a.id === assetId || a.symbol === assetId);
  const numericId = backendStock ? Number(backendStock.id) : NaN;
    const localOnly = Number.isNaN(numericId);
  let tradeRes: any = null;
    if (!localOnly) {
      tradeRes = await executeTradeApi(numericId, 'BUY', amount) as any;
    } else {
      // use symbol fallback so server registers the trade
      const sym = backendStock?.symbol || asset.symbol;
      tradeRes = await executeTradeApi({ symbol: sym }, 'BUY', amount) as any;
    }

    // 2) Mettre à jour l'état local si le backend a réussi (ou si pas d'id numérique)
    const updatedUser = {
      ...user,
      balance: user.balance - totalCost,
      portfolio: [...user.portfolio],
    };

    const portfolioItem = updatedUser.portfolio.find(item => item.assetId === assetId);
    if (portfolioItem) {
      const totalQuantity = portfolioItem.quantity + amount;
      const totalCostAll = portfolioItem.avgBuyPrice * portfolioItem.quantity + asset.currentPrice * amount;
      portfolioItem.quantity = totalQuantity;
      portfolioItem.avgBuyPrice = totalCostAll / totalQuantity;
    } else {
      updatedUser.portfolio.push({
        assetId,
        quantity: amount,
        avgBuyPrice: asset.currentPrice,
      });
    }

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      assetId,
      type: 'buy',
      quantity: amount,
      price: asset.currentPrice,
      timestamp: new Date(),
    };

    // Synchroniser le solde avec la valeur renvoyée par le serveur si disponible
    if (tradeRes && tradeRes.new_balance !== undefined && tradeRes.new_balance !== null) {
      updatedUser.balance = Number(tradeRes.new_balance);
    }
    setUser(updatedUser);
    setTransactions([newTransaction, ...transactions]);

    // 3) Synchroniser avec le backend (rafraîchir la liste des transactions)
    try {
      const serverTxs = await fetchTransactionsApi() as unknown as any[];
      const mapped: Transaction[] = (serverTxs || []).map((t: any) => ({
        id: String(t.id),
        assetId: String(t?.stock?.id ?? t?.stock_id ?? t?.symbol ?? ''),
        type: String(t?.transaction_type || t?.type || '').toLowerCase() === 'sell' ? 'sell' : 'buy',
        quantity: Number(t?.quantity ?? 0),
        price: Number(t?.price ?? 0),
        timestamp: new Date(t?.timestamp || t?.created_at || Date.now()),
      }));
      if (mapped.length) setTransactions(mapped);
    } catch {
      // silencieux si erreur de sync
    }

    // 4) Hydrater le portefeuille depuis le serveur pour refléter quantités/prix moyens exacts
    try {
      const serverPortfolio = await fetchPortfolio() as unknown as any[];
      const mappedPortfolio = (serverPortfolio || []).map((p: any) => ({
        assetId: String(p?.stock?.id ?? p?.stock_id ?? p?.stock?.symbol ?? ''),
        quantity: Number(p?.quantity ?? 0),
        avgBuyPrice: Number(p?.average_price ?? 0),
      }));
      setUser(prev => ({ ...prev, portfolio: mappedPortfolio }));
    } catch {
      // ignorer en cas d'erreur (offline, 401, etc.)
    }

  return { serverSaved: !localOnly, localOnly };
  };

  const sellAsset = async (assetId: string, amount: number): Promise<{ serverSaved: boolean; localOnly: boolean }> => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) throw new Error('Actif introuvable');

    const portfolioItem = user.portfolio.find(p => p.assetId === assetId);
    if (!portfolioItem) {
      throw new Error('Vous ne possédez pas cet actif dans votre portefeuille');
    }
    
    if (portfolioItem.quantity < amount) {
      throw new Error(`Quantité insuffisante. Vous possédez ${portfolioItem.quantity} ${asset.symbol}, mais tentez de vendre ${amount}`);
    }

    // 1) Trade backend en premier (si id numérique)
    const backendStock = assets.find(a => a.id === assetId || a.symbol === assetId);
    const numericId = backendStock ? Number(backendStock.id) : NaN;
    const localOnly = Number.isNaN(numericId);
    let sellRes: any = null;
    if (!localOnly) {
      sellRes = await executeTradeApi(numericId, 'SELL', amount) as any;
    } else {
      const sym = backendStock?.symbol || asset.symbol;
      sellRes = await executeTradeApi({ symbol: sym }, 'SELL', amount) as any;
    }

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

    // Synchroniser le solde avec la valeur renvoyée par le serveur si disponible
    if (sellRes && sellRes.new_balance !== undefined && sellRes.new_balance !== null) {
      updatedUser.balance = Number(sellRes.new_balance);
    }
    setUser(updatedUser);
    setTransactions([newTransaction, ...transactions]);

    // 3) Synchroniser avec le backend
    try {
      const serverTxs = await fetchTransactionsApi() as unknown as any[];
      const mapped: Transaction[] = (serverTxs || []).map((t: any) => ({
        id: String(t.id),
        assetId: String(t?.stock?.id ?? t?.stock_id ?? t?.symbol ?? ''),
        type: String(t?.transaction_type || t?.type || '').toLowerCase() === 'sell' ? 'sell' : 'buy',
        quantity: Number(t?.quantity ?? 0),
        price: Number(t?.price ?? 0),
        timestamp: new Date(t?.timestamp || t?.created_at || Date.now()),
      }));
      if (mapped.length) setTransactions(mapped);
    } catch {
      // silencieux si erreur de sync
    }

    // 4) Hydrater le portefeuille depuis le serveur
    try {
      const serverPortfolio = await fetchPortfolio() as unknown as any[];
      const mappedPortfolio = (serverPortfolio || []).map((p: any) => ({
        assetId: String(p?.stock?.id ?? p?.stock_id ?? p?.stock?.symbol ?? ''),
        quantity: Number(p?.quantity ?? 0),
        avgBuyPrice: Number(p?.average_price ?? 0),
      }));
      setUser(prev => ({ ...prev, portfolio: mappedPortfolio }));
    } catch {
      // ignorer en cas d'erreur
    }

  return { serverSaved: !localOnly, localOnly };
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
