import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product } from '@/models/Product';
import { productService } from '@/config/setup';

interface StockContextType {
  stockSyncVersion: number;
  notifyStockChange: () => void;
  lowStockItems: Product[];
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stockSyncVersion, setStockSyncVersion] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

  const refreshLowStock = useCallback(async () => {
    try {
      const items = await productService.fetchLowStock();
      setLowStockItems(Array.isArray(items) ? items : []);
    } catch {
      // Keep last successful snapshot to avoid noisy UI resets.
    }
  }, []);

  const notifyStockChange = useCallback(() => {
    setStockSyncVersion(prev => prev + 1);
    void refreshLowStock();
  }, [refreshLowStock]);

  useEffect(() => {
    void refreshLowStock();
    const interval = setInterval(() => {
      void refreshLowStock();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshLowStock]);

  return (
    <StockContext.Provider value={{ stockSyncVersion, notifyStockChange, lowStockItems }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockSync = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStockSync must be used within a StockProvider');
  }
  return context;
};
