import { useState, useEffect, useCallback } from 'react';
import { inventoryService, productService, alertService, authService } from '@/config/setup';
import type { Supplier, Suministra } from '@/models/Inventory';
import type { Product } from '@/models/Product';
import { SupplierDrawer } from './SupplierDrawer';
import { getErrorMessage } from '@/utils/getErrorMessage';

type SubTab = 'proveedores' | 'alertas' | 'movimientos';

interface InventorySectionProps {
  onNavigateToProducts?: () => void;
}

export function InventorySection({ onNavigateToProducts }: InventorySectionProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('movimientos');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSupplierDrawerOpen, setIsSupplierDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const isAdmin = authService.isAdmin();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, m, p, sm] = await Promise.all([
        inventoryService.getSuppliers(),
        inventoryService.getMovements(),
        productService.getProducts(),
        inventoryService.getLowStock()
      ]);
      setSuppliers(Array.isArray(s) ? s : (s?.data || []));
      setMovements(Array.isArray(m) ? m : (m?.data || []));
      setProducts(Array.isArray(p) ? p : (p?.data || []));
      setLowStock(Array.isArray(sm) ? sm : (sm?.data || []));
    } catch (e) { alertService.showToast('error', 'Error al cargar inventario'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleDeleteSupplier = async (id: number) => {
    if (await alertService.showConfirm('¿Eliminar?', '¿Seguro?', 'Sí', 'No')) {
      try {
        await inventoryService.deleteSupplier(id);
        alertService.showToast('success', 'Eliminado');
        loadData();
      } catch (e) { alertService.showToast('error', 'Error al eliminar'); }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Control de Inventario</h2>
          <p className="text-sm text-slate-500 font-medium">Historial, proveedores y alertas críticas.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-slate-100 p-1">
          {(['movimientos', 'proveedores', 'alertas'] as SubTab[]).map(t => (
            <button key={t} onClick={() => setActiveSubTab(t)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all capitalize ${activeSubTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>{t}</button>
          ))}
        </div>
      </header>

      <main>
        {activeSubTab === 'movimientos' ? (
          <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Producto</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Cant.</th>
                    <th className="px-6 py-4">Justificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t">
                  {movements.map(m => {
                    const p = products.find(prod => prod.cod_prod === m.cod_prod);
                    return (
                      <tr key={m.id_mov} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-500">{new Date(m.fecha_mov).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{p?.nom_prod || `ID: ${m.cod_prod}`}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${m.tipo_mov === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{m.tipo_mov}</span>
                        </td>
                        <td className={`px-6 py-4 font-black ${m.tipo_mov === 'entrada' ? 'text-emerald-500' : 'text-red-500'}`}>{m.tipo_mov === 'entrada' ? '+' : '-'}{m.cantidad_mov}</td>
                        <td className="px-6 py-4 text-slate-500 italic">{m.desc_mov}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeSubTab === 'proveedores' ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => { setSelectedSupplier(null); setIsSupplierDrawerOpen(true); }} className="px-4 py-2 bg-[#ec131e] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200">Nuevo Proveedor</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map(s => (
                <div key={s.cod_prov} className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#ec131e]"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedSupplier(s); setIsSupplierDrawerOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => handleDeleteSupplier(s.cod_prov!)} className="p-2 text-slate-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900">{s.nom_prov}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{s.tel_prov}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border rounded-3xl p-10 text-center space-y-4">
             <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#ec131e]"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
             <h3 className="text-lg font-bold text-slate-900">Módulo de Alertas Críticas</h3>
             <p className="text-sm text-slate-500 max-w-sm mx-auto">Esta sección muestra productos que requieren atención inmediata del proveedor seleccionado.</p>
             <div className="pt-4"><span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest">En Desarrollo</span></div>
          </div>
        )}
      </main>

      <SupplierDrawer isOpen={isSupplierDrawerOpen} supplier={selectedSupplier} onClose={() => setIsSupplierDrawerOpen(false)} onSuccess={loadData} />
    </div>
  );
}
