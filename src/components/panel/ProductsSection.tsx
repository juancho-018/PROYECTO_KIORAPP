import { useState, useEffect, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { productService, alertService, authService } from '@/config/setup';
import type { Product, Category } from '@/models/Product';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { ProductDrawer } from './ProductDrawer';
import { CategoryModal } from './CategoryModal';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
const IMG_BASE = API_URL.replace('/api', '');

function getImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  const cleanBase = IMG_BASE.endsWith('/') ? IMG_BASE.slice(0, -1) : IMG_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const isAdmin = authService.isAdmin();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, c] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(Array.isArray(p) ? p : (p?.data || []));
      setCategories(Array.isArray(c) ? c : (c?.data || []));
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar datos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (selectedCategories.length > 0) {
      result = result.filter(p => p.fk_cod_cats?.some(c => selectedCategories.includes(c)));
    }

    if (filterStock === 'low') result = result.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0);
    if (filterStock === 'out') result = result.filter(p => p.stock_actual === 0);

    if (search.trim()) {
      const fuse = new Fuse(result, { keys: ['nom_prod', 'desc_prod', 'cod_prod'], threshold: 0.3 });
      result = fuse.search(search).map(r => r.item);
    }

    return result;
  }, [products, search, selectedCategories, filterStock]);

  const handleDelete = async (id: number) => {
    if (await alertService.showConfirm('¿Eliminar?', '¿Seguro?', 'Sí', 'No')) {
      try {
        await productService.deleteProduct(id);
        alertService.showToast('success', 'Eliminado');
        loadData();
      } catch (e) { alertService.showToast('error', 'Error al eliminar'); }
    }
  };

  const stockBadgeColor = (p: Product) => {
    if (p.stock_actual <= 0) return 'bg-red-500';
    if (p.stock_actual <= (p.stock_minimo || 5)) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Catálogo</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
            Productos
          </h1>
          <p className="text-sm text-slate-500 font-medium">Gestión integral de productos y precios.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setIsCategoryModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-[#ec131e]/30 px-4 py-2.5 text-sm font-bold text-[#ec131e] hover:bg-[#ec131e]/5 transition-all">
            Categorías
          </button>
          {isAdmin && (
            <button onClick={() => { setSelectedProduct(null); setIsDrawerOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] active:scale-95">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Nuevo Producto
            </button>
          )}
        </div>
      </header>

      {/* Search */}
      <div className="relative max-w-lg">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-3 focus:ring-[#ec131e]/10 transition-all"
        />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <svg className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p className="font-semibold text-lg">Sin productos</p>
          <p className="text-sm">{search ? 'No hay resultados para tu búsqueda' : 'Agrega tu primer producto'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map(p => (
            <div key={p.cod_prod} className="group relative rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
              {/* Image */}
              <div className="h-40 w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 relative">
                {p.imagen_prod ? (
                    <img
                      src={getImageUrl(p.imagen_prod)}
                      alt={p.nom_prod}
                      className="max-h-full max-w-full object-contain mx-auto transition-none"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <svg className="h-12 w-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                {/* Stock Badge */}
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-sm ${stockBadgeColor(p)}`}>
                  STOCK: {p.stock_actual ?? 0}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-wider">COD: {p.cod_prod}</span>
                </div>
                <h3 className="font-bold text-[#111827] leading-tight mt-1">{p.nom_prod}</h3>
                {p.desc_prod && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.desc_prod}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-[#111827]">
                    <span className="text-sm text-[#ec131e] mr-0.5">$</span>
                    {Number(p.precio_prod).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { setSelectedProduct(p); setIsDrawerOpen(true); }}
                    className="flex-1 rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-all"
                  >Editar</button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(p.cod_prod!)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-100 transition-all"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductDrawer isOpen={isDrawerOpen} product={selectedProduct} onClose={() => setIsDrawerOpen(false)} onSuccess={loadData} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSuccess={loadData} />
    </div>
  );
}
