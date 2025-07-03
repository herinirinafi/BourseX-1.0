// This file helps with module resolution
export const paths = {
  screens: {
    login: './screens/LoginScreen',
    signUp: './screens/SignUpScreen',
    home: './screens/HomeScreen',
    watchlist: './screens/WatchlistScreen',
    portfolio: './screens/PortfolioScreen',
    news: './screens/NewsScreen',
    settings: './screens/SettingsScreen',
    stockDetail: './screens/StockDetailScreen',
    alerts: './screens/AlertsScreen',
    stocks: './screens/StocksScreen',
  },
  // Add other paths as needed
} as const;
