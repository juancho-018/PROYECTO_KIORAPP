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
  
<<<<<<< HEAD
  // Real active filters
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    categories: [] as number[],
    stock: 'all' as 'all' | 'low' | 'out',
    minPrice: '',
    maxPrice: '',
    tipo: 'all' as string
  });

  // Pending filters (UI state)
  const [pendingFilters, setPendingFilters] = useState({ ...activeFilters });
=======
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
>>>>>>> origin/develop

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

<<<<<<< HEAD
  const [showFilters, setShowFilters] = useState(false);

  // Movements state for Drawer
  const [movements, setMovements] = useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

=======
>>>>>>> origin/develop
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

<<<<<<< HEAD
  const loadMovements = useCallback(async (productId: number) => {
    setLoadingMovements(true);
    try {
      const { inventoryService } = await import('@/config/setup');
      const data = await inventoryService.getMovements(productId);
      setMovements(data && 'data' in data ? data.data : (Array.isArray(data) ? data : []));
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar movimientos'));
    } finally {
      setLoadingMovements(false);
    }
  }, []);

  const handleSaveProduct = async (dto: any, isEdit: boolean) => {
    try {
      if (isEdit && selectedProduct?.cod_prod) {
        await productService.updateProduct(selectedProduct.cod_prod, dto);
        alertService.showToast('success', 'Producto actualizado');
      } else {
        await productService.createProduct(dto);
        alertService.showToast('success', 'Producto creado');
      }
      loadData();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al guardar producto'));
      throw e;
    }
  };

  const handleSaveMovement = async (mov: any) => {
    try {
      const { inventoryService } = await import('@/config/setup');
      await inventoryService.createMovement(mov);
      alertService.showToast('success', 'Movimiento registrado');
      if (mov.cod_prod) await loadMovements(mov.cod_prod);
      loadData(); // refresh stock in list
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al registrar movimiento'));
      throw e;
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    
    const { search, categories: selCats, stock, minPrice, maxPrice, tipo } = activeFilters;

    if (selCats.length > 0) {
      result = result.filter(p => p.fk_cod_cats?.some(c => selCats.includes(c)));
    }

    if (stock === 'low') result = result.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0);
    if (stock === 'out') result = result.filter(p => p.stock_actual === 0);

    if (minPrice !== '') result = result.filter(p => p.precio_prod >= Number(minPrice));
    if (maxPrice !== '') result = result.filter(p => p.precio_prod <= Number(maxPrice));

    if (tipo !== 'all') {
      result = result.filter(p => (p.tipo_prod || 'alimento') === tipo);
    }
=======
  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (selectedCategories.length > 0) {
      result = result.filter(p => p.fk_cod_cats?.some(c => selectedCategories.includes(c)));
    }

    if (filterStock === 'low') result = result.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0);
    if (filterStock === 'out') result = result.filter(p => p.stock_actual === 0);
>>>>>>> origin/develop

    if (search.trim()) {
      const fuse = new Fuse(result, { keys: ['nom_prod', 'desc_prod', 'cod_prod'], threshold: 0.3 });
      result = fuse.search(search).map(r => r.item);
    }

    return result;
<<<<<<< HEAD
  }, [products, activeFilters]);

  const handleApplyFilters = () => {
    setActiveFilters({ ...pendingFilters });
    setShowFilters(false);
    alertService.showToast('success', 'Filtros aplicados');
  };

  const handleClearFilters = () => {
    const cleared = {
      search: '',
      categories: [],
      stock: 'all' as const,
      minPrice: '',
      maxPrice: '',
      tipo: 'all'
    };
    setPendingFilters(cleared);
    setActiveFilters(cleared);
  };

  const handleDelete = async (id: number) => {
    if (await alertService.showConfirm('¿Eliminar Producto?', 'Esta acción es irreversible.', 'Sí, eliminar', 'Cancelar')) {
      try {
        await productService.deleteProduct(id);
        alertService.showToast('success', 'Producto eliminado');
        loadData();
      } catch (e) { alertService.showToast('error', getErrorMessage(e, 'Error al eliminar')); }
=======
  }, [products, search, selectedCategories, filterStock]);

  const handleDelete = async (id: number) => {
    if (await alertService.showConfirm('¿Eliminar?', '¿Seguro?', 'Sí', 'No')) {
      try {
        await productService.deleteProduct(id);
        alertService.showToast('success', 'Eliminado');
        loadData();
      } catch (e) { alertService.showToast('error', 'Error al eliminar'); }
>>>>>>> origin/develop
    }
  };

  const stockBadgeColor = (p: Product) => {
    if (p.stock_actual <= 0) return 'bg-red-500';
    if (p.stock_actual <= (p.stock_minimo || 5)) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

<<<<<<< HEAD
  const toggleCategoryPending = (id: number) => {
    setPendingFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(id) 
        ? prev.categories.filter(c => c !== id) 
        : [...prev.categories, id]
    }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ec131e]/5 border border-[#ec131e]/10">
            <div className="h-2 w-2 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ec131e]">Inventario Maestro</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Productos <span className="text-[#ec131e]">&</span> Stock
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className={`rounded-2xl px-6 py-3.5 text-sm font-black transition-all flex items-center gap-2 ${showFilters ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[#ec131e]/30'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            Filtros
          </button>
          <button onClick={() => setIsCategoryModalOpen(true)} className="rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-700 ring-1 ring-slate-200 hover:ring-[#ec131e]/30 transition-all">Categorías</button>
          {isAdmin && (
            <button onClick={() => { setSelectedProduct(null); setIsDrawerOpen(true); }} className="rounded-2xl bg-[#ec131e] px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-[#ec131e]/20 transition-all hover:bg-[#d01019]">Nuevo Producto</button>
=======
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
>>>>>>> origin/develop
          )}
        </div>
      </header>

<<<<<<< HEAD
      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-slate-100/50 space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Buscador</label>
              <input
                type="text"
                placeholder="Nombre o código..."
                value={pendingFilters.search}
                onChange={e => setPendingFilters(p => ({ ...p, search: e.target.value }))}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 px-5 text-sm font-bold focus:border-[#ec131e] focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Elemento</label>
              <select
                value={pendingFilters.tipo}
                onChange={e => setPendingFilters(p => ({ ...p, tipo: e.target.value }))}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 px-5 text-sm font-bold focus:border-[#ec131e] focus:bg-white focus:outline-none transition-all"
              >
                <option value="all">Cualquier Tipo</option>
                <option value="alimento">🍎 Alimento</option>
                <option value="bebida">🥤 Bebida</option>
                <option value="otro">📦 Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rango de Precio</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={pendingFilters.minPrice} onChange={e => setPendingFilters(p => ({ ...p, minPrice: e.target.value }))} className="w-1/2 rounded-2xl border border-slate-100 bg-slate-50 py-4 px-4 text-sm font-bold focus:border-[#ec131e] focus:bg-white transition-all" />
                <input type="number" placeholder="Max" value={pendingFilters.maxPrice} onChange={e => setPendingFilters(p => ({ ...p, maxPrice: e.target.value }))} className="w-1/2 rounded-2xl border border-slate-100 bg-slate-50 py-4 px-4 text-sm font-bold focus:border-[#ec131e] focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-50">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categorías</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c.cod_cat}
                  onClick={() => toggleCategoryPending(c.cod_cat!)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border capitalize ${pendingFilters.categories.includes(c.cod_cat!) ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                >
                  {c.nom_cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
            <button onClick={handleClearFilters} className="px-8 py-3 rounded-2xl ring-1 ring-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Limpiar</button>
            <button onClick={handleApplyFilters} className="px-10 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Aplicar Filtros</button>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-80 bg-white border border-slate-50 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
          <p className="font-black text-xl text-slate-800">No hay resultados</p>
          <button onClick={handleClearFilters} className="mt-4 text-[#ec131e] font-black text-xs uppercase tracking-widest">Resetear filtros</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(p => (
            <div key={p.cod_prod} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="h-48 w-full overflow-hidden bg-white relative">
                {p.imagen_prod ? (
                  <img src={getImageUrl(p.imagen_prod)} alt={p.nom_prod} className="h-full w-full object-contain p-6" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-100 font-black text-4xl">?</div>
                )}
                <span className={`absolute top-4 right-4 rounded-full px-3 py-1 text-[9px] font-black uppercase text-white ${stockBadgeColor(p)}`}>STOCK: {p.stock_actual}</span>
                <span className="absolute bottom-4 left-4 rounded-lg px-2 py-1 text-[8px] font-black uppercase bg-white/80 backdrop-blur-sm text-slate-500 border border-slate-100 shadow-sm">{p.tipo_prod || 'alimento'}</span>
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">{p.nom_prod}</h3>
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900"><span className="text-xs text-[#ec131e] mr-0.5">$</span>{Number(p.precio_prod).toLocaleString('es-CO')}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setSelectedProduct(p); setIsDrawerOpen(true); }} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(p.cod_prod!)} className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:text-red-600 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    )}
                  </div>
=======
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
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
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
>>>>>>> origin/develop
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

<<<<<<< HEAD
      <ProductDrawer 
        isOpen={isDrawerOpen} 
        product={selectedProduct} 
        onClose={() => setIsDrawerOpen(false)} 
        onSuccess={loadData}
        categories={categories}
        movements={movements}
        loadingMovements={loadingMovements}
        onSave={handleSaveProduct}
        onSaveMovement={handleSaveMovement}
        onLoadMovements={loadMovements}
      />
=======
      <ProductDrawer isOpen={isDrawerOpen} product={selectedProduct} onClose={() => setIsDrawerOpen(false)} onSuccess={loadData} />
>>>>>>> origin/develop
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSuccess={loadData} />
    </div>
  );
}
