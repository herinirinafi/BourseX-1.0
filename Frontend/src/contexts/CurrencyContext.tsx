import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { getItem, setItem } from '../services/storage';

export type Currency = 'MGA' | 'USD';

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amount: number | string | null | undefined) => string;
  symbol: string; // Ar or $
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = 'prefs.currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('MGA');

  useEffect(() => {
    (async () => {
      const saved = await getItem(STORAGE_KEY);
      if (saved === 'MGA' || saved === 'USD') setCurrencyState(saved);
    })();
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    setItem(STORAGE_KEY, c);
  }, []);

  const format = useCallback((amount: number | string | null | undefined) => {
    const n = Number(amount ?? 0);
    if (Number.isNaN(n)) return currency === 'MGA' ? 'Ar 0' : '$0.00';
    try {
      if (currency === 'MGA') {
        return new Intl.NumberFormat('fr-MG', {
          style: 'currency',
          currency: 'MGA',
          maximumFractionDigits: 0,
          currencyDisplay: 'symbol',
        }).format(n);
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
        currencyDisplay: 'symbol',
      }).format(n);
    } catch {
      // Fallbacks
      if (currency === 'MGA') {
        const parts = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
        return `Ar ${parts}`;
      }
      return `$${n.toFixed(2)}`;
    }
  }, [currency]);

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    format,
    symbol: currency === 'MGA' ? 'Ar' : '$',
  }), [currency, setCurrency, format]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};
