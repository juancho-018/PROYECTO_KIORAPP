import { useState, useEffect } from 'react';
import { inventoryService, alertService } from '@/config/setup';
import type { Product } from '@/models/Product';
import type { Movement } from '@/models/Inventory';

interface ProductDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductDetailsDrawer({ isOpen, onClose, product }: ProductDetailsDrawerProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const movementsArray = Array.isArray(movements) ? movements : [];
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      void loadMovements();
    }
  }, [isOpen, product]);

  const loadMovements = async () => {
    if (!product) return;
    setIsLoading(true);
    try {
      const data = await inventoryService.getMovements(product.cod_prod);
      setMovements(data && 'data' in data ? data.data : (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Error fetching movements:', error);
      alertService.showToast('error', 'No se pudieron cargar los movimientos');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-[#fdfcfb] shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#ec131e]">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{product.nom_prod}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{product.nom_cat || 'Sin Categoría'}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition-colors">
               <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* General Info Grid */}
          <section className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precio Unitario</p>
              <p className="text-lg font-black text-slate-900">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.precio_prod || 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Actual</p>
              <p className={`text-lg font-black ${product.stock_actual <= product.stock_minimo ? 'text-red-500' : 'text-emerald-500'}`}>
                {product.stock_actual} unidades
              </p>
            </div>
          </section>

          {/* Activity Log */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 border-l-4 border-[#ec131e] pl-3">Historial de Movimientos</h3>
               <button onClick={loadMovements} className="text-xs text-slate-400 hover:text-[#ec131e] font-bold">Refrescar</button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                     <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                     <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                     <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cant.</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {isLoading ? (
                     Array.from({ length: 3 }).map((_, i) => (
                       <tr key={i} className="animate-pulse">
                         <td colSpan={3} className="px-4 py-4 bg-slate-50/50 h-10"></td>
                       </tr>
                     ))
                   ) : movementsArray.length === 0 ? (
                     <tr>
                       <td colSpan={3} className="px-4 py-8 text-center text-slate-400 font-medium">No hay movimientos registrados para este producto.</td>
                     </tr>
                   ) : (
                     movementsArray.map((m) => (
                       <tr key={m.id_mov} className="hover:bg-slate-50/80 transition-colors">
                         <td className="px-4 py-3 font-medium text-slate-600">{new Date(m.fecha_mov).toLocaleDateString()}</td>
                         <td className="px-4 py-3">
                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              m.tipo_mov === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {m.tipo_mov === 'entrada' ? 'Entrada' : 'Salida'}
                            </span>
                         </td>
                         <td className="px-4 py-3 font-bold text-slate-900">{m.cantidad}</td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>
          </section>
        </div>

        <footer className="p-6 border-t border-slate-100 bg-white">
          <button 
            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800"
            onClick={onClose}
          >
            Cerrar Detalle
          </button>
        </footer>
      </div>
    </div>
  );
}
