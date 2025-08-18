export interface Asset {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  balance: number;
  portfolio: PortfolioItem[];
  badges: string[];
  level: number;
  xp: number;
}

export interface PortfolioItem {
  assetId: string;
  quantity: number;
  avgBuyPrice: number;
  currentValue?: number; // Add current value from backend
  currentPrice?: number; // Add current price from backend
}

export interface Transaction {
  id: string;
  assetId: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface LeaderboardUser {
  userId: string;
  name: string;
  rank: number;
  portfolioValue: number;
  weeklyChange: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  progress: number;
  target: number;
  type: 'daily' | 'weekly' | 'achievement';
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  marketEffect: 'bull' | 'bear' | 'volatile';
  intensity: number; // 1-5
}
