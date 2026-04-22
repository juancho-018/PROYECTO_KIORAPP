import { useState, useEffect } from 'react';
import { inventoryService, alertService, productService } from '@/config/setup';
import type { Supplier, Movement, Suministra, CreateSupplierDto } from '@/models/Inventory';
import type { Product } from '@/models/Product';
import { SupplierDrawer } from './SupplierDrawer';

interface BulkAssignmentRow {
  id: string;
  fk_cod_prov: string;
  cod_prod: string;
  stock: string;
  stock_minimo: string;
}

export function InventorySection() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suministra, setSuministra] = useState<Suministra[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'movimientos' | 'proveedores' | 'asignaciones'>('movimientos');
  const [isLoading, setIsLoading] = useState(true);
  
  // Supplier CRUD state
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Bulk Assignment state
  const [bulkRows, setBulkRows] = useState<BulkAssignmentRow[]>([
    { id: crypto.randomUUID(), fk_cod_prov: '', cod_prod: '', stock: '', stock_minimo: '' }
  ]);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, m, p, sm] = await Promise.all([
        inventoryService.fetchSuppliers(),
        inventoryService.fetchMovements(),
        productService.fetchProducts(500, 0),
        inventoryService.fetchLowStockAlerts()
      ]);
      setSuppliers(Array.isArray(s) ? s : []);
      setMovements(Array.isArray(m) ? m : []);
      setProducts(Array.isArray(p) ? p : []);
      setSuministra(Array.isArray(sm) ? sm : []);
    } catch (error) {
      alertService.showToast('error', 'Error al cargar inventario');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Supplier CRUD functions
  const handleSubmitSupplier = async (id: number | null, data: CreateSupplierDto) => {
    try {
      if (id) {
        await inventoryService.updateSupplier(id, data);
      } else {
        await inventoryService.createSupplier(data);
      }
      void loadData();
    } catch (error) {
      alertService.showToast('error', 'Error al procesar proveedor');
      throw error;
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    const confirm = await alertService.showConfirm('¿Eliminar Proveedor?', 'Esta acción no se puede deshacer.', 'Eliminar', 'Cancelar');
    if (confirm) {
      try {
        await inventoryService.deleteSupplier(id);
        alertService.showToast('success', 'Proveedor eliminado');
        void loadData();
      } catch (error) {
        alertService.showToast('error', 'Error al eliminar');
      }
    }
  };

  // Bulk Assignment functions
  const addBulkRow = () => {
    setBulkRows([...bulkRows, { id: crypto.randomUUID(), fk_cod_prov: '', cod_prod: '', stock: '', stock_minimo: '' }]);
  };

  const removeBulkRow = (id: string) => {
    if (bulkRows.length > 1) {
      setBulkRows(bulkRows.filter(r => r.id !== id));
    }
  };

  const updateBulkRow = (id: string, field: keyof BulkAssignmentRow, value: string) => {
    setBulkRows(bulkRows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSaveBulk = async () => {
    const validRows = bulkRows.filter(r => r.fk_cod_prov && r.cod_prod && r.stock !== '');
    if (validRows.length === 0) {
      alertService.showToast('warning', 'Completa al menos una fila válida');
      return;
    }

    setIsSavingBulk(true);
    try {
      for (const row of validRows) {
        await inventoryService.upsertSuministra({
          fk_cod_prov: Number(row.fk_cod_prov),
          cod_prod: Number(row.cod_prod),
          stock: Number(row.stock),
          stock_minimo: Number(row.stock_minimo || 0)
        });
      }
      alertService.showToast('success', `${validRows.length} registros actualizados`);
      setBulkRows([{ id: crypto.randomUUID(), fk_cod_prov: '', cod_prod: '', stock: '', stock_minimo: '' }]);
      void loadData();
    } catch (error) {
      alertService.showToast('error', 'Error al guardar asignaciones');
    } finally {
      setIsSavingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Gestión de Logística</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Control de Inventario</h2>
          <p className="text-sm text-slate-500 font-medium italic">Monitorea movimientos, proveedores y stock maestro en tiempo real.</p>
        </div>
        <div className="flex gap-2 rounded-2xl bg-slate-100/50 p-1.5 backdrop-blur-sm border border-slate-200/50">
          {[
            { id: 'movimientos', label: 'Movimientos' },
            { id: 'proveedores', label: 'Proveedores' },
            { id: 'asignaciones', label: 'Stock Maestro' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeSubTab === tab.id 
                ? 'bg-white text-[#ec131e] shadow-lg shadow-black/5 ring-1 ring-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Movimientos</p>
            <p className="text-xl font-black text-slate-900">{movements.length}</p>
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proveedores</p>
            <p className="text-xl font-black text-slate-900">{suppliers.length}</p>
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alertas Stock</p>
            <p className="text-xl font-black text-slate-900">{suministra.length}</p>
          </div>
        </div>
      </div>

      {activeSubTab === 'asignaciones' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ingreso de Stock Masivo</h3>
            <button 
              onClick={addBulkRow}
              className="text-[10px] font-black uppercase tracking-widest text-[#ec131e] hover:underline"
            >
              + Agregar Fila
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Proveedor</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Producto</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Alerta (Mín)</th>
                    <th className="px-5 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bulkRows.map((row) => (
                    <tr key={row.id}>
                      <td className="p-3">
                        <select
                          value={row.fk_cod_prov}
                          onChange={(e) => updateBulkRow(row.id, 'fk_cod_prov', e.target.value)}
                          className="w-full rounded-xl border-slate-100 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-[#ec131e]"
                        >
                          <option value="">Seleccionar...</option>
                          {suppliers.map((s) => (
                            <option key={s.cod_prov} value={s.cod_prov}>{s.nom_prov}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={row.cod_prod}
                          onChange={(e) => updateBulkRow(row.id, 'cod_prod', e.target.value)}
                          className="w-full rounded-xl border-slate-100 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-[#ec131e]"
                        >
                          <option value="">Seleccionar...</option>
                          {products.map((p) => (
                            <option key={p.cod_prod} value={p.cod_prod}>{p.nom_prod}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          placeholder="0"
                          value={row.stock}
                          onChange={(e) => updateBulkRow(row.id, 'stock', e.target.value)}
                          className="w-full rounded-xl border-slate-100 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-[#ec131e]"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          placeholder="5"
                          value={row.stock_minimo}
                          onChange={(e) => updateBulkRow(row.id, 'stock_minimo', e.target.value)}
                          className="w-full rounded-xl border-slate-100 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:ring-[#ec131e]"
                        />
                      </td>
                      <td className="p-3">
                         <button 
                          onClick={() => removeBulkRow(row.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                          disabled={bulkRows.length === 1}
                         >
                           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             <div className="bg-slate-50/50 p-4 flex justify-end">
                <button
                  onClick={handleSaveBulk}
                  disabled={isSavingBulk || bulkRows.every(r => !r.fk_cod_prov || !r.cod_prod)}
                  className="rounded-xl bg-[#ec131e] px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] active:scale-95 disabled:opacity-50"
                >
                  {isSavingBulk ? 'Guardando...' : 'Aplicar Cambios (Guardar)'}
                </button>
             </div>
          </div>
        </section>
      )}

      {activeSubTab === 'proveedores' && (
        <div className="flex justify-end mb-4">
           <button 
            onClick={() => { setSelectedSupplier(null); setIsSupplierDrawerOpen(true); }}
            className="rounded-xl bg-[#ec131e] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019]"
          >
            + Nuevo Proveedor
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            {activeSubTab === 'movimientos' ? (
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tipo</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Producto</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Cantidad</th>
              </tr>
            ) : activeSubTab === 'proveedores' ? (
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Empresa / Nombre</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identificación</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Contacto</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 w-24">Acciones</th>
              </tr>
            ) : (
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Proveedor Suministrante</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Producto</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Stock Actual</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Crítico (Mín)</th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-6 h-12 bg-slate-50/20"></td>
                </tr>
              ))
            ) : activeSubTab === 'movimientos' ? (
              (Array.isArray(movements) ? movements : []).map((m) => (
                <tr key={m.id_mov} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{new Date(m.fecha_mov).toLocaleDateString('es-CO')}</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(m.fecha_mov).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      m.tipo_mov === 'entrada' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${m.tipo_mov === 'entrada' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {m.tipo_mov === 'entrada' ? 'Entrada' : 'Salida'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-sm font-black text-slate-900 group-hover:text-[#ec131e] transition-colors">
                        {products.find(p => p.cod_prod === m.cod_prod)?.nom_prod || `#${m.cod_prod}`}
                     </p>
                     <p className="text-[10px] font-bold text-slate-400 lowercase">Ref: KI-{m.cod_prod}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-sm font-black text-slate-900">{m.cantidad}</span>
                    <span className="ml-1 text-[10px] font-bold text-slate-400">unids</span>
                  </td>
                </tr>
              ))
            ) : activeSubTab === 'proveedores' ? (
              (Array.isArray(suppliers) ? suppliers : []).map((s) => (
                <tr key={s.cod_prov} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-slate-900">{s.nom_prov}</td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{s.id_prov || 'SIN ID'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-3.5 h-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm font-medium">{s.tel_prov || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1">
                       <button 
                        onClick={() => { setSelectedSupplier(s); setIsSupplierDrawerOpen(true); }}
                        className="p-2 text-slate-400 hover:text-[#ec131e] hover:bg-red-50 rounded-xl transition-all"
                       >
                         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                       </button>
                       <button 
                        onClick={() => handleDeleteSupplier(s.cod_prov)}
                        className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                       >
                         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              (Array.isArray(suministra) ? suministra : []).map((link) => (
                <tr key={link.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 text-sm text-slate-500 font-bold">{link.nom_prov || `#${link.fk_cod_prov}`}</td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-slate-900">
                      {products.find((p) => p.cod_prod === link.cod_prod)?.nom_prod || `#${link.cod_prod}`}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                      link.stock < link.stock_minimo ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {link.stock}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-slate-400 text-xs tracking-wider">
                    {link.stock_minimo}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SupplierDrawer 
        isOpen={isSupplierDrawerOpen}
        onClose={() => setIsSupplierDrawerOpen(false)}
        supplier={selectedSupplier}
        onSuccess={loadData}
        onSubmit={handleSubmitSupplier}
      />
    </div>
  );
}
