import React from 'react';
import type { Product } from '@/models/Product';

interface AlertasTabProps {
  products: Product[];
}

export const AlertasTab: React.FC<AlertasTabProps> = ({ products }) => {
  const lowStockProducts = products.filter(p => (p.stock_actual || 0) <= (p.stock_minimo || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
      {lowStockProducts.map(p => (
        <div key={p.cod_prod} className="bg-white rounded-[2.5rem] p-8 shadow-sm border-l-4 border-kiora-red">
          <h4 className="font-bold text-slate-900">{p.nom_prod}</h4>
          <p className="text-xs text-kiora-red font-bold mt-1">Quedan {p.stock_actual} unid. (Mín: {p.stock_minimo})</p>
        </div>
      ))}
      {lowStockProducts.length === 0 && (
        <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
          <p className="text-slate-400 font-bold">No hay alertas de stock bajo.</p>
        </div>
      )}
    </div>
  );
};
