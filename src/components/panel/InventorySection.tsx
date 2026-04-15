import { useState, useEffect, useCallback } from 'react';
import { inventoryService, alertService } from '@/config/setup';
import type { Supplier, Movement, LowStockItem } from '@/models/Inventory';
import { getErrorMessage } from '@/utils/getErrorMessage';

type SubTab = 'proveedores' | 'movimientos' | 'alertas';

const EMPTY_SUPPLIER: Omit<Supplier, 'cod_prov'> = { nom_prov: '', tel_prov: '', correo_prov: '', dir_prov: '' };

export function InventorySection() {
  const [subTab, setSubTab] = useState<SubTab>('proveedores');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Supplier drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Omit<Supplier, 'cod_prov'>>(EMPTY_SUPPLIER);
  const [saving, setSaving] = useState(false);

  // Movement drawer
  const [movDrawer, setMovDrawer] = useState(false);
  const [movForm, setMovForm] = useState<{ tipo_mov: 'entrada' | 'salida'; cantidad_mov: number; fk_cod_prod: string; desc_mov: string }>({
    tipo_mov: 'entrada', cantidad_mov: 1, fk_cod_prod: '', desc_mov: '',
  });
  const [savingMov, setSavingMov] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sups, movs, low] = await Promise.all([
        inventoryService.getSuppliers(),
        inventoryService.getMovements(),
        inventoryService.getLowStock(),
      ]);
      setSuppliers(sups);
      setMovements(movs);
      setLowStock(low);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar inventario'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleSaveSupplier() {
    if (!form.nom_prov.trim()) { alertService.showToast('warning', 'El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      if (editing?.cod_prov) {
        await inventoryService.updateSupplier(editing.cod_prov, form);
        alertService.showToast('success', 'Proveedor actualizado');
      } else {
        await inventoryService.createSupplier(form);
        alertService.showToast('success', 'Proveedor creado');
      }
      setDrawerOpen(false);
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSupplier(s: Supplier) {
    const ok = await alertService.showConfirm('Eliminar proveedor', `¿Eliminar "${s.nom_prov}"?`, 'Eliminar', 'Cancelar');
    if (!ok || !s.cod_prov) return;
    try {
      await inventoryService.deleteSupplier(s.cod_prov);
      alertService.showToast('success', 'Proveedor eliminado');
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al eliminar'));
    }
  }

  async function handleSaveMovement() {
    if (!movForm.fk_cod_prod || movForm.cantidad_mov <= 0) { alertService.showToast('warning', 'Completa todos los campos'); return; }
    setSavingMov(true);
    try {
      await inventoryService.createMovement({
        tipo_mov: movForm.tipo_mov,
        cantidad_mov: movForm.cantidad_mov,
        fk_cod_prod: Number(movForm.fk_cod_prod),
        desc_mov: movForm.desc_mov,
      });
      alertService.showToast('success', 'Movimiento registrado');
      setMovDrawer(false);
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al registrar movimiento'));
    } finally {
      setSavingMov(false);
    }
  }

  const tabs: { id: SubTab; label: string; badge?: number }[] = [
    { id: 'proveedores', label: 'Proveedores' },
    { id: 'movimientos', label: 'Movimientos' },
    { id: 'alertas', label: '⚠️ Alertas', badge: lowStock.length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Almacén</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">Inventario</h1>
          <p className="text-sm text-slate-500 font-medium">Proveedores, movimientos y alertas de stock.</p>
        </div>
        {subTab === 'proveedores' && (
          <button
            onClick={() => { setEditing(null); setForm(EMPTY_SUPPLIER); setDrawerOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 hover:bg-[#d01019] active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Nuevo Proveedor
          </button>
        )}
        {subTab === 'movimientos' && (
          <button
            onClick={() => setMovDrawer(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 hover:bg-[#d01019] active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Registrar Movimiento
          </button>
        )}
      </header>

      {/* Sub Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all ${subTab === t.id ? 'bg-white text-[#ec131e] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ec131e]" />
        </div>
      ) : (
        <>
          {/* Suppliers */}
          {subTab === 'proveedores' && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Nombre', 'Teléfono', 'Correo', 'Dirección', 'Acciones'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {suppliers.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">Sin proveedores</td></tr>
                  ) : suppliers.map(s => (
                    <tr key={s.cod_prov} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-[#111827]">{s.nom_prov}</td>
                      <td className="px-5 py-3 text-slate-500">{s.tel_prov ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{s.correo_prov ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{s.dir_prov ?? '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditing(s); setForm({ nom_prov: s.nom_prov, tel_prov: s.tel_prov ?? '', correo_prov: s.correo_prov ?? '', dir_prov: s.dir_prov ?? '' }); setDrawerOpen(true); }}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
                          >Editar</button>
                          <button
                            onClick={() => void handleDeleteSupplier(s)}
                            className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-100"
                          >Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Movements */}
          {subTab === 'movimientos' && (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Tipo', 'Producto', 'Cantidad', 'Descripción', 'Fecha'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {movements.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">Sin movimientos</td></tr>
                  ) : movements.map(m => (
                    <tr key={m.id_mov} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${m.tipo_mov === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {m.tipo_mov === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#111827]">{m.producto?.nom_prod ?? `Prod #${m.fk_cod_prod}`}</td>
                      <td className="px-5 py-3 text-slate-700 font-bold">{m.cantidad_mov}</td>
                      <td className="px-5 py-3 text-slate-500">{m.desc_mov ?? '—'}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{m.fecha_mov ? new Date(m.fecha_mov).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Low Stock Alerts */}
          {subTab === 'alertas' && (
            <div className="space-y-3">
              {lowStock.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-400">
                  <svg className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="font-semibold text-lg text-emerald-500">¡Todo el stock está OK!</p>
                  <p className="text-sm">No hay productos por debajo del stock mínimo.</p>
                </div>
              ) : lowStock.map(item => (
                <div key={item.cod_prod} className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
                  <div>
                    <p className="font-bold text-[#111827]">{item.nom_prod}</p>
                    <p className="text-xs text-red-500 font-medium mt-0.5">
                      Stock actual: <strong>{item.stock_actual}</strong> — Mínimo: <strong>{item.stock_minimo}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">Bajo stock</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Supplier Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-extrabold">{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {[
                { label: 'Nombre *', key: 'nom_prov' },
                { label: 'Teléfono', key: 'tel_prov' },
                { label: 'Correo', key: 'correo_prov' },
                { label: 'Dirección', key: 'dir_prov' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[key] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20"
                  />
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={() => void handleSaveSupplier()} disabled={saving} className="flex-1 rounded-xl bg-[#ec131e] py-2.5 text-sm font-bold text-white hover:bg-[#d01019] disabled:opacity-60">
                {saving ? 'Guardando…' : (editing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movement Drawer */}
      {movDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMovDrawer(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-extrabold">Registrar Movimiento</h2>
              <button onClick={() => setMovDrawer(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
                <div className="flex gap-2">
                  {(['entrada', 'salida'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setMovForm(f => ({ ...f, tipo_mov: t }))}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${movForm.tipo_mov === t ? (t === 'entrada' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {t === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">ID Producto *</label>
                <input
                  type="number"
                  placeholder="Código del producto"
                  value={movForm.fk_cod_prod}
                  onChange={e => setMovForm(f => ({ ...f, fk_cod_prod: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={movForm.cantidad_mov}
                  onChange={e => setMovForm(f => ({ ...f, cantidad_mov: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea
                  rows={3}
                  value={movForm.desc_mov}
                  onChange={e => setMovForm(f => ({ ...f, desc_mov: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={() => setMovDrawer(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600">Cancelar</button>
              <button onClick={() => void handleSaveMovement()} disabled={savingMov} className="flex-1 rounded-xl bg-[#ec131e] py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {savingMov ? 'Guardando…' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
