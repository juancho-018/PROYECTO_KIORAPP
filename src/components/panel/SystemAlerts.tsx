import React, { useEffect, useState } from 'react';
import { productService } from '../../config/setup';
import type { Product } from '../../models/Product';

export const SystemAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [lowRes, expRes] = await Promise.all([
          productService.getLowStock(),
          productService.getExpiredProducts()
        ]);
        
        const lowStock = (lowRes?.data || []).map((p: any) => ({ ...p, alertType: 'stock' }));
        const expired = (expRes || []).map((p: any) => ({ ...p, alertType: 'expired' }));
        
        setAlerts([...lowStock, ...expired]);
      } catch (err) {
        // Silently handle backend downtime
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-error animate-ping" />
        <span className="label-sm text-on-surface-variant font-semibold">Alertas ({alerts.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.slice(0, 4).map((alert) => (
          <div key={alert.cod_prod} className="bg-error-container/20 border border-error-container/50 p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 transition-all hover:bg-error-container/30">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface border border-error-container/50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">Stock bajo: {alert.nom_prod}</p>
              <p className="text-xs text-on-surface-variant">Quedan {alert.stock_actual} uds (mín. {alert.stock_minimo})</p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-error bg-error-container/20 px-2 py-1 rounded-md">Urgente</span>
          </div>
        ))}
      </div>
    </div>
  );
};
