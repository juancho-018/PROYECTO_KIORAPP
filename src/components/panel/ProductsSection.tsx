import { useState, useEffect, useCallback, useMemo } from 'react';
import { productService, alertService, authService } from '@/config/setup';
import type { Product } from '@/models/Product';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const user = authService.getUser();
  const isAdmin = user?.rol_usu?.toLowerCase() === 'administrador';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar productos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = Array.isArray(products) ? products : [];
    if (!q) return source;
    return source.filter(p => 
      p.nom_prod.toLowerCase().includes(q) || 
      p.cod_prod.toString().includes(q) ||
      p.desc_prod?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleExportExcel = async () => {
    try {
      await productService.exportExcel();
      alertService.showToast('success', 'Excel exportado');
    } catch (e) {
      alertService.showToast('error', 'Error al exportar Excel');
    }
  };

  return (
    <div className="space-y-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Catálogo</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">Productos</h1>
          <p className="text-sm text-slate-500 font-medium">Gestión integral de productos y precios.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
          >
            Exportar Excel
          </button>
        )}
      </header>

      <div className="relative group max-w-md">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#ec131e] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#ec131e] focus:outline-none focus:ring-4 focus:ring-[#ec131e]/10 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ec131e]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(Array.isArray(filtered) ? filtered : []).map(p => (
            <div key={p.cod_prod} className="group relative flex flex-col rounded-3xl border border-slate-100 bg-white p-2 shadow-sm transition-all hover:shadow-xl hover:border-[#ec131e]/20">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
                <img
                  src={p.imagen_prod || '/img/placeholder-product.png'}
                  alt={p.nom_prod}
                  className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                    (p.stock_actual ?? 0) <= (p.stock_minimo ?? 0) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    Stock: {p.stock_actual}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">COD: {p.cod_prod}</p>
                <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1 mb-1 group-hover:text-[#ec131e] transition-colors">{p.nom_prod}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5rem] mb-4">{p.desc_prod || 'Sin descripción'}</p>
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-lg font-black text-slate-900">
                    <span className="text-xs text-[#ec131e] mr-0.5">$</span>
                    {Number(p.precio_prod || 0).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No se encontraron productos coincidentes.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
