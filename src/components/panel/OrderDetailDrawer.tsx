import { useState, useEffect } from 'react';
import { productService, userService, alertService } from '@/config/setup';
import type { Order, OrderItem } from '@/models/Order';
import type { Product } from '@/models/Product';
import type { User } from '@/models/User';

interface OrderDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailDrawer({ isOpen, onClose, order }: OrderDetailDrawerProps) {
  const [items, setItems] = useState<(OrderItem & { productLabel?: string })[]>([]);
  const [cashier, setCashier] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      void loadDetails();
    } else {
      setItems([]);
      setCashier(null);
    }
  }, [isOpen, order]);

  const loadDetails = async () => {
    if (!order) return;
    setIsLoading(true);
    try {
      // 1. Get items (already hydrated or fetch if needed)
      const orderItems = order.items || [];
      
      // 2. Fetch products and cashier in parallel
      const [allProducts, users] = await Promise.all([
        productService.fetchProducts(500, 0),
        order.fk_id_usu ? userService.fetchUsers(100, 0) : Promise.resolve({ data: [] })
      ]);

      const productMap = new Map<number, Product>();
      if (Array.isArray(allProducts)) {
        allProducts.forEach(p => productMap.set(p.cod_prod, p));
      }

      const hydratedItems = orderItems.map(item => ({
        ...item,
        productLabel: productMap.get(item.cod_prod)?.nom_prod || `Prod #${item.cod_prod}`
      }));

      setItems(hydratedItems);

      if (order.fk_id_usu) {
        const foundCashier = (users as any).data?.find((u: any) => u.id_usu === order.fk_id_usu);
        setCashier(foundCashier || null);
      }
    } catch (error) {
      alertService.showToast('error', 'Error al cargar detalles de la orden');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Content */}
      <aside className="relative h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
        <header className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-900">Resumen de la Orden</h3>
            <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-600 transition-all">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ec131e]">ID: #{order?.id_vent}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-slate-500">
              {order && new Date(order.fecha_vent).toLocaleString('es-CO')}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status Section */}
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Estado y Pago</h4>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cajero/Atendido por:</p>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#ec131e]/10 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#ec131e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{cashier?.nom_usu || 'Sistema/Admin'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Método</p>
                <span className="text-sm font-black text-slate-900">{order?.metodopago_usu || 'Efectivo'}</span>
              </div>
            </div>
          </section>

          {/* Products Section */}
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Productos ({items.length})</h4>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(n => <div key={n} className="h-12 bg-slate-50 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                        {item.cantidad}x
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{item.productLabel}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precio_unit)} / u
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precio_unit * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className="border-t border-slate-100 p-6 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Facturado</span>
             <span className="text-2xl font-black text-slate-900">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order?.montofinal_vent || 0)}
             </span>
          </div>
          <button 
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800 active:scale-95"
          >
            Cerrar Detalle
          </button>
        </footer>
      </aside>
    </div>
  );
}
