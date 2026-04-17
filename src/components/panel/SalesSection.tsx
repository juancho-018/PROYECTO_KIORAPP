import { useState, useEffect, useCallback } from 'react';
import { orderService, productService, inventoryService, alertService, authService } from '@/config/setup';
import type { Order, Invoice, Paginated } from '@/models/Order';
import type { CreateOrderDto } from '@/services/OrderService';
import type { Product } from '@/models/Product';
import type { Movement } from '@/models/Inventory';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Nuevos componentes importados
import { OrderDetailModal } from './OrderDetailModal';
import { OrderDrawer } from './OrderDrawer';

type SubTab = 'ventas' | 'facturas' | 'movimientos';

interface SalesSectionProps {
  orderForm: CreateOrderDto;
  setOrderForm: React.Dispatch<React.SetStateAction<CreateOrderDto>>;
  addToCart: (p: Product) => void;
  removeFromCart: (cod_prod: number) => void;
  updateQuantity: (cod_prod: number, delta: number) => void;
  clearCart: () => void;
  cartKey: string | null;
}

const EMPTY_ORDER: CreateOrderDto = {
  metodopago_usu: 'efectivo',
  items: [],
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  completada: 'bg-emerald-100 text-emerald-700',
  cancelada: 'bg-red-100 text-red-700',
  reembolsada: 'bg-purple-100 text-purple-700',
};

export function SalesSection({
  orderForm,
  setOrderForm,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  cartKey
}: SalesSectionProps) {
  const [subTab, setSubTab] = useState<SubTab>('ventas');
  const [orders, setOrders] = useState<Paginated<Order>>({ data: [] });
  const [invoices, setInvoices] = useState<Paginated<Invoice>>({ data: [] });
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [invPage, setInvPage] = useState(1); // Mantenemos para posible paginación de facturas

  // Search in drawer
  const [prodSearch, setProdSearch] = useState('');

  // Detail modal
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // Create order drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Export loading
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ords, invs, prods, movs] = await Promise.all([
        orderService.getOrders(page),
        orderService.getInvoices(1), // Assuming invPage might be used later
        productService.getProducts(),
        inventoryService.getMovements(),
      ]);
      setOrders(ords);
      setInvoices(invs);
      setProducts(prods);
      const mappedMovs = movs.map(m => ({
        ...m,
        producto: prods.find(p => p.cod_prod === m.fk_cod_prod) || m.producto
      }));
      setMovements(mappedMovs);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar datos'));
    } finally {
      setLoading(false);
    }
  }, [page]); // invPage excluded as it's not strictly changing right now but good to keep

  useEffect(() => { void load(); }, [load]);

  async function handleCreateOrder() {
    if (!orderForm.items.length) { 
      alertService.showToast('warning', 'El carrito está vacío'); 
      return; 
    }
    setSaving(true);
    try {
      await orderService.createOrder(orderForm);
      alertService.showToast('success', 'Venta registrada exitosamente');
      setDrawerOpen(false);
      clearCart();
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al registrar venta'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelOrder() {
    const ok = await alertService.showConfirm(
      '¿Cancelar pedido?',
      '¿Estás seguro de que deseas cancelar este pedido? Se perderán todos los productos seleccionados.',
      'Sí, cancelar',
      'Mantener'
    );
    if (!ok) return;

    clearCart();
    alertService.showToast('info', 'Pedido cancelado y carrito vaciado');
    setDrawerOpen(false);
  }

  async function handleRefund(id: number) {
    const confirm = await alertService.showConfirm('¿Solicitar Reembolso?', 'Al reembolsar esta venta, el stock de los productos se devolverá al inventario automáticamente.', 'Sí, reembolsar', 'Mantener');
    if (confirm) {
      try {
        await orderService.updateOrderStatus(id, 'reembolsada' as any);
        alertService.showToast('success', 'Venta reembolsada y stock restaurado');
        setDetailOrder(null);
        void load();
      } catch (e) {
        alertService.showToast('error', getErrorMessage(e, 'Error al reembolsar'));
      }
    }
  }

  async function handleStatusChange(id: number, estado: 'pendiente' | 'completada' | 'cancelada') {
    try {
      await orderService.updateOrderStatus(id, estado);
      alertService.showToast('success', 'Estado actualizado');
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al actualizar estado'));
    }
  }

  async function handleDeleteOrder(id: number) {
    const ok = await alertService.showConfirm('Eliminar venta', '¿Eliminar esta venta y sus items?', 'Eliminar', 'Cancelar');
    if (!ok) return;
    try {
      await orderService.deleteOrder(id);
      alertService.showToast('success', 'Venta eliminada');
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al eliminar'));
    }
  }

  async function handleExport(type: 'excel' | 'pdf') {
    setExporting(true);
    try {
      if (type === 'excel') await orderService.exportExcel();
      else await orderService.exportPdf();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al exportar'));
    } finally {
      setExporting(false);
    }
  }

  const filteredProducts = Array.isArray(products) 
    ? products.filter(p => {
        const q = prodSearch.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const name = (p.nom_prod || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const code = String(p.cod_prod || '');
        if (!q) return true;
        if (name.includes(q) || code.includes(q)) return true;
        
        if (q.length >= 3) {
          for (let i = 0; i < name.length - q.length + 1; i++) {
            let diff = 0;
            for (let j = 0; j < q.length; j++) {
              if (name[i + j] !== q[j]) diff++;
              if (diff > 1) break;
            }
            if (diff <= 1) return true;
          }
        }
        return false;
      })
    : [];

  function safePrice(v: unknown): number {
    const n = Number(v);
    return isNaN(n) || !isFinite(n) ? 0 : n;
  }

  const cartTotal = orderForm.items.reduce((acc, i) => acc + i.cantidad * safePrice(i.precio_unit), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between group">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10 transition-colors group-hover:bg-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Comercial</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl transition-all">
            Ventas <span className="text-[#ec131e]">&</span> Facturas
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-xl">
            Registro de ventas, facturación contable y exportaciones del historial de tu negocio.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => void handleExport('excel')}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-100 focus:ring-4 focus:ring-emerald-100 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
          </button>
          <button
            onClick={() => void handleExport('pdf')}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100 focus:ring-4 focus:ring-red-100 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            PDF
          </button>
          <button
            onClick={() => { setDrawerOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] focus:ring-4 focus:ring-[#ec131e]/20 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Venta
          </button>
        </div>
      </header>

      {/* Sub Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100/80 p-1 w-fit border border-slate-200/50 shadow-inner">
        {(['ventas', 'facturas', 'movimientos'] as SubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`rounded-xl px-6 py-2 text-sm font-extrabold transition-all capitalize hover:bg-white/50 hover:text-slate-800 ${
              subTab === t 
                ? 'bg-white text-[#ec131e] shadow-sm hover:!bg-white' 
                : 'text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#ec131e] border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Orders Table */}
          {subTab === 'ventas' && (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm ring-1 ring-slate-900/5">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-md">
                    <tr>
                      {['#', 'Fecha', 'Método de pago', 'Total', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.data.length === 0 ? (
                      <tr><td colSpan={6} className="py-16 text-center text-slate-400 font-medium">No hay ventas registradas.</td></tr>
                    ) : orders.data.map(o => (
                      <tr key={o.id_vent} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-4 font-black text-slate-400 group-hover:text-slate-500 transition-colors">#{o.id_vent}</td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{o.fecha_vent ? new Date(o.fecha_vent).toLocaleDateString('es-CO') : '—'}</td>
                        <td className="px-5 py-4 capitalize text-slate-600 font-bold">{o.metodopago_usu ?? '—'}</td>
                        <td className="px-5 py-4 font-black text-[#111827] text-base drop-shadow-sm">
                          <span className="text-xs text-[#ec131e] relative -top-1 mr-0.5">$</span>
                          {Number(o.montofinal_vent ?? 0).toLocaleString('es-CO')}
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            <select
                              value={o.estado ?? 'pendiente'}
                              onChange={e => void handleStatusChange(o.id_vent!, e.target.value as 'pendiente' | 'completada' | 'cancelada')}
                              className={`appearance-none rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 pr-6 ${
                                ESTADO_COLORS[o.estado ?? 'pendiente']?.replace('text-', 'text-').replace('bg-', 'bg-').concat(' border-current/10')
                              }`}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="completada">Completada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>
                            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-current opacity-60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try { const d = await orderService.getOrderById(o.id_vent!); setDetailOrder(d); }
                                catch (e) { alertService.showToast('error', getErrorMessage(e, 'Error al cargar detalle')); }
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-slate-200"
                            >Ver</button>
                            <button
                              onClick={() => void handleDeleteOrder(o.id_vent!)}
                              className="rounded-xl border border-red-100 bg-red-50/50 px-3.5 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-100 hover:text-red-700 focus:ring-2 focus:ring-red-100"
                            >Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {orders.pagination && orders.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-6">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95">← Anterior</button>
                  <span className="flex items-center px-4 py-2 text-sm text-slate-500 font-extrabold bg-slate-100/50 rounded-xl">
                    {page} <span className="mx-2 text-slate-300 font-medium">/</span> {orders.pagination.totalPages}
                  </span>
                  <button disabled={page >= orders.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 active:scale-95">Siguiente →</button>
                </div>
              )}
            </>
          )}

          {/* Invoices Table */}
          {subTab === 'facturas' && (
            <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm ring-1 ring-slate-900/5">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-md">
                  <tr>
                    {['#Factura', 'Venta', 'Usuario', 'Monto Total', 'Fecha'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.data.length === 0 ? (
                    <tr><td colSpan={5} className="py-16 text-center text-slate-400 font-medium">Sin facturas emitidas</td></tr>
                  ) : invoices.data.map(inv => (
                    <tr key={inv.id_fac} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-4 font-black text-slate-400 group-hover:text-slate-500">#{inv.id_fac}</td>
                      <td className="px-5 py-4 text-slate-600 font-bold">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">Venta #{inv.fk_id_vent}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">Usuario <span className="font-bold">#{inv.id_usu}</span></td>
                      <td className="px-5 py-4 font-black text-emerald-600 text-base drop-shadow-sm">
                        <span className="text-xs text-emerald-500 relative -top-1 mr-0.5">$</span>
                        {Number(inv.montototal_vent ?? 0).toLocaleString('es-CO')}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-bold tracking-wide">{inv.fecha_fac ? new Date(inv.fecha_fac).toLocaleDateString('es-CO') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Movements */}
          {subTab === 'movimientos' && (
            <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-sm ring-1 ring-slate-900/5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-md">
                    <tr>
                      {['Tipo', 'Producto', 'Cantidad', 'Descripción', 'Fecha'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {!Array.isArray(movements) || movements.length === 0 ? (
                      <tr><td colSpan={5} className="py-16 text-center text-slate-400 font-medium">Sin movimientos registrados</td></tr>
                    ) : movements.map(m => (
                      <tr key={m.id_mov} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-transform group-hover:scale-105 ${
                             m.tipo_mov === 'entrada' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                              : 'bg-red-50 text-red-600 border-red-200/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                          }`}>
                            {m.tipo_mov === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#111827] line-clamp-1">{m.producto?.nom_prod || 'Producto eliminado'}</span>
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Cód: {m.fk_cod_prod}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-800 font-black text-sm tabular-nums">
                           {m.tipo_mov === 'entrada' ? '+' : '-'}{m.cantidad_mov}
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs font-medium leading-relaxed max-w-xs truncate">
                           {m.desc_mov || '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-[11px] font-bold tracking-wide uppercase">
                          {m.fecha_mov ? new Date(m.fecha_mov).toLocaleString('es-CO', { 
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <OrderDetailModal
          detailOrder={detailOrder}
          onClose={() => setDetailOrder(null)}
          safePrice={safePrice}
          estadoColors={ESTADO_COLORS}
          onRefund={handleRefund}
        />
      )}

      {/* Create Order Drawer - Cart Mode */}
      <OrderDrawer
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        prodSearch={prodSearch}
        setProdSearch={setProdSearch}
        filteredProducts={filteredProducts}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        cartTotal={cartTotal}
        handleCreateOrder={() => void handleCreateOrder()}
        onCancelOrder={() => void handleCancelOrder()}
        saving={saving}
        safePrice={safePrice}
      />
    </div>
  );
}
