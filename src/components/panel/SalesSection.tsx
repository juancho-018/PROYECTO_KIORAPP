import { useState, useEffect, useCallback } from 'react';
import { orderService, alertService } from '@/config/setup';
import type { Order, Invoice, Paginated } from '@/models/Order';
import type { CreateOrderDto } from '@/services/OrderService';
import { getErrorMessage } from '@/utils/getErrorMessage';

type SubTab = 'ventas' | 'facturas';

const EMPTY_ORDER: CreateOrderDto = {
  metodopago_usu: 'efectivo',
  items: [{ cod_prod: 0, cantidad: 1, precio_unit: 0 }],
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  completada: 'bg-emerald-100 text-emerald-700',
  cancelada: 'bg-red-100 text-red-600',
};

export function SalesSection() {
  const [subTab, setSubTab] = useState<SubTab>('ventas');
  const [orders, setOrders] = useState<Paginated<Order>>({ data: [] });
  const [invoices, setInvoices] = useState<Paginated<Invoice>>({ data: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [invPage, setInvPage] = useState(1);

  // Detail modal
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // Create order drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<CreateOrderDto>(EMPTY_ORDER);
  const [saving, setSaving] = useState(false);

  // Export loading
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ords, invs] = await Promise.all([
        orderService.getOrders(page),
        orderService.getInvoices(invPage),
      ]);
      setOrders(ords);
      setInvoices(invs);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar ventas'));
    } finally {
      setLoading(false);
    }
  }, [page, invPage]);

  useEffect(() => { void load(); }, [load]);

  async function handleCreateOrder() {
    const validItems = orderForm.items.filter(i => i.cod_prod > 0 && i.cantidad > 0 && i.precio_unit > 0);
    if (!validItems.length) { alertService.showToast('warning', 'Agrega al menos un producto válido'); return; }
    setSaving(true);
    try {
      await orderService.createOrder({ ...orderForm, items: validItems });
      alertService.showToast('success', 'Venta registrada exitosamente');
      setDrawerOpen(false);
      setOrderForm(EMPTY_ORDER);
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al registrar venta'));
    } finally {
      setSaving(false);
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

  function addItem() {
    setOrderForm(f => ({ ...f, items: [...f.items, { cod_prod: 0, cantidad: 1, precio_unit: 0 }] }));
  }

  function removeItem(idx: number) {
    setOrderForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  function updateItem(idx: number, key: keyof typeof orderForm.items[0], value: number) {
    setOrderForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [key]: value } : it) }));
  }

  const total = orderForm.items.reduce((acc, i) => acc + i.cantidad * i.precio_unit, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Comercial</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
            Ventas <span className="text-[#ec131e]">&</span> Facturas
          </h1>
          <p className="text-sm text-slate-500 font-medium">Registro de ventas, facturación y exportaciones.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => void handleExport('excel')}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
          </button>
          <button
            onClick={() => void handleExport('pdf')}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            PDF
          </button>
          <button
            onClick={() => { setOrderForm(EMPTY_ORDER); setDrawerOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 hover:bg-[#d01019] active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Nueva Venta
          </button>
        </div>
      </header>

      {/* Sub Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        {(['ventas', 'facturas'] as SubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition-all capitalize ${subTab === t ? 'bg-white text-[#ec131e] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ec131e]" />
        </div>
      ) : (
        <>
          {/* Orders Table */}
          {subTab === 'ventas' && (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['#', 'Fecha', 'Método de pago', 'Total', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.data.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 text-center text-slate-400">Sin ventas</td></tr>
                    ) : orders.data.map(o => (
                      <tr key={o.id_vent} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-400">#{o.id_vent}</td>
                        <td className="px-5 py-3 text-slate-600">{o.fecha_vent ? new Date(o.fecha_vent).toLocaleDateString() : '—'}</td>
                        <td className="px-5 py-3 capitalize text-slate-600">{o.metodopago_usu ?? '—'}</td>
                        <td className="px-5 py-3 font-bold text-[#ec131e]">${Number(o.montofinal_vent ?? 0).toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <select
                            value={o.estado ?? 'pendiente'}
                            onChange={e => void handleStatusChange(o.id_vent!, e.target.value as 'pendiente' | 'completada' | 'cancelada')}
                            className={`rounded-full px-3 py-1 text-xs font-bold border-0 cursor-pointer ${ESTADO_COLORS[o.estado ?? 'pendiente']}`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                try { const d = await orderService.getOrderById(o.id_vent!); setDetailOrder(d); }
                                catch (e) { alertService.showToast('error', getErrorMessage(e, 'Error al cargar detalle')); }
                              }}
                              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200"
                            >Ver</button>
                            <button
                              onClick={() => void handleDeleteOrder(o.id_vent!)}
                              className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-100"
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
                <div className="flex justify-center gap-2 mt-4">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-40">← Anterior</button>
                  <span className="flex items-center px-4 text-sm text-slate-500">{page} / {orders.pagination.totalPages}</span>
                  <button disabled={page >= orders.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-40">Siguiente →</button>
                </div>
              )}
            </>
          )}

          {/* Invoices Table */}
          {subTab === 'facturas' && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['#Factura', 'Venta', 'Usuario', 'Monto Total', 'Fecha'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.data.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-400">Sin facturas</td></tr>
                  ) : invoices.data.map(inv => (
                    <tr key={inv.id_fac} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-400">#{inv.id_fac}</td>
                      <td className="px-5 py-3 text-slate-600">Venta #{inv.fk_id_vent}</td>
                      <td className="px-5 py-3 text-slate-600">Usuario #{inv.id_usu}</td>
                      <td className="px-5 py-3 font-bold text-emerald-600">${Number(inv.montototal_vent ?? 0).toFixed(2)}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{inv.fecha_fac ? new Date(inv.fecha_fac).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">Detalle Venta #{detailOrder.id_vent}</h3>
              <button onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Fecha:</span><span className="font-semibold">{detailOrder.fecha_vent ? new Date(detailOrder.fecha_vent).toLocaleString() : '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Método de pago:</span><span className="font-semibold capitalize">{detailOrder.metodopago_usu ?? '—'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Estado:</span><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ESTADO_COLORS[detailOrder.estado ?? 'pendiente']}`}>{detailOrder.estado}</span></div>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500">Producto</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Cant.</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Precio unit.</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(detailOrder.items ?? []).map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{item.nom_prod ?? `Prod #${item.cod_prod}`}</td>
                      <td className="px-4 py-2 text-right">{item.cantidad}</td>
                      <td className="px-4 py-2 text-right">${Number(item.precio_unit).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-bold">${(item.cantidad * item.precio_unit).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-[#ec131e]">
              <span>Total</span>
              <span>${Number(detailOrder.montofinal_vent ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-extrabold">Nueva Venta</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Método de pago</label>
                <select
                  value={orderForm.metodopago_usu}
                  onChange={e => setOrderForm(f => ({ ...f, metodopago_usu: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Productos</label>
                  <button onClick={addItem} className="text-xs font-bold text-[#ec131e] hover:text-[#d01019]">+ Agregar</button>
                </div>
                <div className="space-y-3">
                  {orderForm.items.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Ítem {idx + 1}</span>
                        {orderForm.items.length > 1 && (
                          <button onClick={() => removeItem(idx)} className="text-red-400 text-xs hover:text-red-600">× Quitar</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Cod. prod</label>
                          <input type="number" value={item.cod_prod || ''} onChange={e => updateItem(idx, 'cod_prod', Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-[#ec131e] focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Cant.</label>
                          <input type="number" min="1" value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-[#ec131e] focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Precio</label>
                          <input type="number" min="0" step="0.01" value={item.precio_unit || ''} onChange={e => updateItem(idx, 'precio_unit', Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-[#ec131e] focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 flex justify-between">
                <span className="text-sm font-bold text-slate-600">Total estimado</span>
                <span className="text-lg font-extrabold text-[#ec131e]">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600">Cancelar</button>
              <button onClick={() => void handleCreateOrder()} disabled={saving} className="flex-1 rounded-xl bg-[#ec131e] py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {saving ? 'Creando…' : 'Registrar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
