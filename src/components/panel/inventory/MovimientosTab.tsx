import React from 'react';
import type { Product } from '@/models/Product';
import type { Movement } from '@/models/Inventory';

interface MovimientosTabProps {
  movements: Movement[];
  products: Product[];
}

export const MovimientosTab: React.FC<MovimientosTabProps> = ({ movements, products }) => {
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-premium ring-1 ring-slate-100/50 animate-in fade-in zoom-in-95 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Cant.</th>
              <th className="px-6 py-4">Justificación</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {movements.length > 0 ? movements.map((m, i) => {
              const p = products.find(prod => prod.cod_prod === m.cod_prod);
              return (
                <tr key={m.id_mov || i} className="group hover:bg-slate-50/80 transition-all duration-300">
                  <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap">
                    {m.fecha_mov ? new Date(m.fecha_mov).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{p?.nom_prod || `ID: ${m.cod_prod}`}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${m.tipo_mov === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {m.tipo_mov}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-black ${m.tipo_mov === 'entrada' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {m.tipo_mov === 'entrada' ? '+' : '-'}{m.cantidad}
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic truncate max-w-[200px]">{m.desc_mov}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">No hay movimientos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
