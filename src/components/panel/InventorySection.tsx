import { useState, useEffect, useCallback } from 'react';
import { inventoryService, alertService, productService, authService } from '@/config/setup';
import type { Supplier } from '@/models/Inventory';
import { getErrorMessage } from '@/utils/getErrorMessage';

type SubTab = 'proveedores' | 'alertas';

const EMPTY_SUPPLIER: Omit<Supplier, 'cod_prov'> = { nom_prov: '', tel_prov: '', correo_prov: '', dir_prov: '' };

export function InventorySection({ onNavigateToProducts }: { onNavigateToProducts?: () => void }) {
  const [subTab, setSubTab] = useState<SubTab>('proveedores');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Supplier drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Omit<Supplier, 'cod_prov'>>(EMPTY_SUPPLIER);
  const [saving, setSaving] = useState(false);

  const user = authService.getUser();
  const isAdmin = user?.rol_usu?.toLowerCase() === 'administrador';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sups, low] = await Promise.all([
        inventoryService.getSuppliers(),
        productService.getLowStockProducts(),
      ]);
      setSuppliers(sups);
      setLowStock(low);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar inventario'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filteredSuppliers = (suppliers || []).filter(s => 
    s.nom_prov.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.tel_prov || '').includes(searchTerm) ||
    (s.correo_prov || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (!isAdmin) {
      alertService.showToast('error', 'No tienes permisos para esta acción');
      return;
    }
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
        {subTab === 'proveedores' && isAdmin && (
          <button
            onClick={() => { setEditing(null); setForm(EMPTY_SUPPLIER); setDrawerOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 hover:bg-[#d01019] active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Nuevo Proveedor
          </button>
        )}
      </header>

      {/* Sub Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        {[
          { id: 'proveedores', label: 'Proveedores' },
          { id: 'alertas', label: '⚠️ Alertas', color: 'text-amber-600' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as SubTab)}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${subTab === t.id ? 'bg-white text-[#ec131e] shadow-sm' : t.color || 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            {t.id === 'alertas' && lowStock.length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{lowStock.length}</span>
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
            <div className="space-y-4">
              <div className="relative group max-w-md">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#ec131e] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#ec131e] focus:outline-none focus:ring-4 focus:ring-[#ec131e]/5 transition-all shadow-sm"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['Nombre', 'Teléfono', 'Correo', 'Dirección', 'Acciones'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSuppliers.length === 0 ? (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">No se encontraron proveedores</td></tr>
                      ) : filteredSuppliers.map(s => (
                        <tr key={s.cod_prov} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-[#111827]">{s.nom_prov}</td>
                        <td className="px-5 py-3 text-slate-500">{s.tel_prov ?? '—'}</td>
                        <td className="px-5 py-3 text-slate-500">{s.correo_prov ?? '—'}</td>
                        <td className="px-5 py-3 text-slate-500">{s.dir_prov ?? '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => { setEditing(s); setForm({ nom_prov: s.nom_prov, tel_prov: s.tel_prov ?? '', correo_prov: s.correo_prov ?? '', dir_prov: s.dir_prov ?? '' }); setDrawerOpen(true); }}
                                  className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
                                >Editar</button>
                                <button
                                  onClick={() => void handleDeleteSupplier(s)}
                                  className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-100"
                                >Eliminar</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* Low Stock Alerts */}
          {subTab === 'alertas' && (
            <div className="space-y-3">
              {!Array.isArray(lowStock) || lowStock.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-slate-400">
                  <svg className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="font-semibold text-lg text-emerald-500">¡Todo el stock está OK!</p>
                  <p className="text-sm">No hay productos por debajo del stock mínimo.</p>
                </div>
              ) : (Array.isArray(lowStock) ? lowStock : []).map(item => (
                <button
                  key={item.cod_prod}
                  onClick={() => onNavigateToProducts?.()}
                  className="w-full flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-left hover:bg-red-100/70 hover:border-red-200 transition-all group cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-[#111827] group-hover:text-[#ec131e] transition-colors">{item.nom_prod}</p>
                    <p className="text-xs text-red-500 font-medium mt-0.5">
                      Stock actual: <strong>{item.stock_actual}</strong> — Mínimo: <strong>{item.stock_minimo}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">Bajo stock</span>
                    <svg className="h-5 w-5 text-red-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
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
                    inputMode={key === 'tel_prov' ? 'numeric' : undefined}
                    value={(form as Record<string, string>)[key] ?? ''}
                    onChange={e => {
                      let val = e.target.value;
                      if (key === 'tel_prov') val = val.replace(/[^0-9]/g, '');
                      setForm(f => ({ ...f, [key]: val }));
                    }}
                    onKeyDown={e => {
                      if (key === 'tel_prov' && !/[0-9]|Backspace|Delete|Arrow|Left|Right|Tab/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                      }
                    }}
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
    </div>
  );
}
