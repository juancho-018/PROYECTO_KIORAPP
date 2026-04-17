import { useState, useEffect, useCallback, useMemo } from 'react';
import { productService, alertService } from '@/config/setup';
import type { Product, Category } from '@/models/Product';
import type { CreateProductDto } from '@/services/ProductService';
import { getErrorMessage } from '@/utils/getErrorMessage';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
const IMG_BASE = API_URL.replace('/api', '');

function getImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanBase = IMG_BASE.endsWith('/') ? IMG_BASE.slice(0, -1) : IMG_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function safePrice(v: unknown): number {
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? 0 : n;
}

// Fuzzy search: normaliza texto, busca parcial e insensible a mayúsculas/acentos
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const nText = normalize(text);
  const nQuery = normalize(query);
  // Búsqueda parcial directa
  if (nText.includes(nQuery)) return true;
  // Levenshtein simplificado para sugerencias con 1-2 errores
  const words = nQuery.split(/\s+/);
  return words.every(w => {
    if (nText.includes(w)) return true;
    // Permitir 1 error de escritura para palabras >= 3 chars
    if (w.length >= 3) {
      for (let i = 0; i < nText.length - w.length + 1; i++) {
        let diff = 0;
        for (let j = 0; j < w.length; j++) {
          if (nText[i + j] !== w[j]) diff++;
          if (diff > 1) break;
        }
        if (diff <= 1) return true;
      }
    }
    return false;
  });
}

// Tipos de productos para clasificación formal (Lista Cerrada)
const PRODUCT_LIST = [
  { id: 'Comida', label: 'Comida', icon: '🍔' },
  { id: 'Bebida', label: 'Bebida', icon: '🥤' },
  { id: 'Dulce', label: 'Dulce', icon: '🍬' },
  { id: 'Snack', label: 'Snack', icon: '🍿' },
  { id: 'Fruta', label: 'Fruta', icon: '🍎' },
  { id: 'Lacteo', label: 'Lácteo', icon: '🥛' },
  { id: 'Aseo', label: 'Aseo', icon: '🧼' },
] as const;

const EMPTY_FORM: CreateProductDto = {
  nom_prod: '',
  desc_prod: '',
  precio_prod: 0,
  stock_actual: 0,
  stock_minimo: 0,
  fk_id_cat: undefined,
  tipos_prod: [],
};

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<number | ''>('');
  
  // Pending filters state
  const [filters, setFilters] = useState({
    tipos: [] as string[],
    stockStatus: '' as 'agotado' | 'bajo' | 'normal' | '',
    minPrice: 0,
    maxPrice: 1000000,
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Stock modal
  const [stockModal, setStockModal] = useState<{ product: Product; mode: 'in' | 'out'; amount: number } | null>(null);

  // Category drawer
  const [catDrawerOpen, setCatDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState({ nom_cat: '', desc_cat: '' });
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [savingCat, setSavingCat] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const serverFilters: Record<string, any> = {
        search,
        fk_cod_cat: filterCat,
        tipos_prod: activeFilters.tipos,
        estado_stock: activeFilters.stockStatus,
        min_price: activeFilters.minPrice,
        max_price: activeFilters.maxPrice,
      };

      const [prods, cats] = await Promise.all([
        productService.getProducts(serverFilters),
        productService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar productos'));
    } finally {
      setLoading(false);
    }
  }, [search, filterCat, activeFilters]);

  useEffect(() => { void load(); }, [load]);

  // Compute max price for filter range
  const maxPrice = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return 100000;
    return Math.max(...products.map(p => safePrice(p.precio_prod)), 100000);
  }, [products]);

  const filtered = useMemo(() => {
    if (!Array.isArray(products)) return [];
    // Note: Search & Category filtration is done on server, but we keep this for instant visual feedback if needed
    // or just return the products as they are already filtered by the server.
    return products;
  }, [products]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setDrawerOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      nom_prod: p.nom_prod,
      desc_prod: p.desc_prod ?? '',
      precio_prod: p.precio_prod,
      stock_actual: p.stock_actual ?? 0,
      stock_minimo: p.stock_minimo ?? 0,
      fk_id_cat: p.fk_cod_cat,
      tipos_prod: p.tipos_prod || [],
    });
    setImageFile(null);
    setImagePreview(getImageUrl(p.imagen_prod));
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!form.nom_prod || form.precio_prod <= 0) {
      alertService.showToast('warning', 'Nombre y precio son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const dto: CreateProductDto = { ...form, imagen: imageFile ?? undefined };
      if (editing?.cod_prod) {
        await productService.updateProduct(editing.cod_prod, dto);
        alertService.showToast('success', 'Producto actualizado');
      } else {
        await productService.createProduct(dto);
        alertService.showToast('success', 'Producto creado');
      }
      setDrawerOpen(false);
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    const ok = await alertService.showConfirm('Eliminar producto', `¿Eliminar "${p.nom_prod}"?`, 'Eliminar', 'Cancelar');
    if (!ok || !p.cod_prod) return;
    try {
      await productService.deleteProduct(p.cod_prod);
      alertService.showToast('success', 'Producto eliminado');
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al eliminar'));
    }
  }

  async function handleStockAdjust() {
    if (!stockModal) return;
    const { product, mode, amount } = stockModal;
    if (amount <= 0) {
      alertService.showToast('warning', 'La cantidad debe ser mayor a 0');
      return;
    }
    const delta = mode === 'in' ? amount : -amount;
    try {
      await productService.updateStock(product.cod_prod!, delta);
      alertService.showToast('success', `${mode === 'in' ? 'Entrada' : 'Salida'} registrada`);
      setStockModal(null);
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al ajustar stock'));
    }
  }

  async function handleSaveCat() {
    if (!catForm.nom_cat.trim()) {
      alertService.showToast('warning', 'El nombre es obligatorio');
      return;
    }
    setSavingCat(true);
    try {
      if (editingCat?.cod_cat) {
        await productService.updateCategory(editingCat.cod_cat, catForm.nom_cat, catForm.desc_cat);
        alertService.showToast('success', 'Categoría actualizada');
      } else {
        await productService.createCategory(catForm.nom_cat, catForm.desc_cat);
        alertService.showToast('success', 'Categoría creada');
      }
      setCatDrawerOpen(false);
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al guardar categoría'));
    } finally {
      setSavingCat(false);
    }
  }

  async function handleDeleteCat(cat: Category) {
    const ok = await alertService.showConfirm('Eliminar categoría', `¿Eliminar "${cat.nom_cat}"?`, 'Eliminar', 'Cancelar');
    if (!ok || !cat.cod_cat) return;
    try {
      await productService.deleteCategory(cat.cod_cat);
      alertService.showToast('success', 'Categoría eliminada');
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al eliminar categoría'));
    }
  }

  const statusColor = (p: Product) =>
    p.alerta_stock_critico || (p.stock_actual !== undefined && p.stock_minimo !== undefined && p.stock_actual <= p.stock_minimo)
      ? 'text-red-500'
      : 'text-emerald-500';

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Catálogo</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
            Productos <span className="text-[#ec131e]">&</span> Categorías
          </h1>
          <p className="text-sm text-slate-500 font-medium">Gestiona tu catálogo de productos y categorías.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setEditingCat(null); setCatForm({ nom_cat: '', desc_cat: '' }); setCatDrawerOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ec131e]/30 px-4 py-2.5 text-sm font-bold text-[#ec131e] hover:bg-[#ec131e]/5 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            Categorías
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Nuevo Producto
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Buscar producto… (tolerante a errores de escritura)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-3 focus:ring-[#ec131e]/10 transition-all"
            />
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value === '' ? '' : Number(e.target.value))}
            className="rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-[#ec131e] focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.cod_cat} value={c.cod_cat}>{c.nom_cat}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
              showFilters ? 'border-[#ec131e] bg-[#ec131e]/5 text-[#ec131e]' : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtros
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 rounded-3xl border border-slate-100 bg-white/80 backdrop-blur-xl p-6 shadow-xl ring-1 ring-black/5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Types (Multi-select) */}
              <div>
                <label className="block text-[10px] font-extrabold text-[#3E2723]/40 uppercase tracking-[0.2em] mb-4">Etiquetas de producto</label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_LIST.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        const newTipos = filters.tipos.includes(t.id)
                          ? filters.tipos.filter(x => x !== t.id)
                          : [...filters.tipos, t.id];
                        setFilters(f => ({ ...f, tipos: newTipos }));
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        filters.tipos.includes(t.id)
                          ? 'bg-[#ec131e] text-white shadow-lg shadow-[#ec131e]/30 scale-105'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95'
                      }`}
                    >
                      <span className="text-base">{t.icon}</span> {t.label}
                    </button>
                  ))}
                  {filters.tipos.length > 0 && (
                     <button 
                        onClick={() => setFilters(f => ({ ...f, tipos: [] }))}
                        className="text-xs font-bold text-[#ec131e] hover:underline px-2"
                     >Limpiar selecc.</button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Stock Status */}
                <div>
                  <label className="block text-[10px] font-extrabold text-[#3E2723]/40 uppercase tracking-[0.2em] mb-4">Estado de Stock</label>
                  <div className="flex gap-2">
                    {[
                      { id: '', label: 'Cualquiera', icon: 'All' },
                      { id: 'normal', label: 'Disponible', icon: '✅' },
                      { id: 'bajo', label: 'Bajo', icon: '⚠️' },
                      { id: 'agotado', label: 'Agotado', icon: '❌' },
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setFilters(f => ({ ...f, stockStatus: st.id as any }))}
                        className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                          filters.stockStatus === st.id
                            ? 'border-[#ec131e] bg-[#ec131e]/5 text-[#ec131e] shadow-sm'
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        <div className="mb-0.5 text-sm">{st.icon}</div>
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-[10px] font-extrabold text-[#3E2723]/40 uppercase tracking-[0.2em] mb-4">Rango de precio</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Mín"
                        value={filters.minPrice === 0 ? '' : filters.minPrice}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setFilters(f => ({ ...f, minPrice: val ? Number(val) : 0 }));
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/10 transition-all font-semibold"
                      />
                    </div>
                    <span className="text-slate-300 font-bold">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Máx"
                        value={filters.maxPrice === 1000000 ? '' : filters.maxPrice}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setFilters(f => ({ ...f, maxPrice: val ? Number(val) : 1000000 }));
                        }}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/10 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  const reset = { tipos: [], stockStatus: '' as const, minPrice: 0, maxPrice: 1000000 };
                  setFilters(reset);
                  setActiveFilters(reset);
                  setSearch('');
                  setFilterCat('');
                }}
                className="text-xs font-bold text-slate-400 hover:text-[#ec131e] transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Limpiar filtros
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
                >Cancelar</button>
                <button
                  onClick={() => setActiveFilters(filters)}
                  className="rounded-xl bg-[#ec131e] px-6 py-2 text-xs font-bold text-white shadow-lg shadow-[#ec131e]/30 hover:bg-[#d01019] transition-all hover:-translate-y-0.5"
                >Aplicar Filtros</button>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {search && (
          <p className="text-xs text-slate-400 font-medium">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            {filtered.length === 0 && search.length >= 3 && ' — Intenta con otra palabra clave'}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ec131e]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <svg className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <p className="font-semibold text-lg">Sin productos</p>
          <p className="text-sm">{search ? 'No hay resultados para tu búsqueda' : 'Agrega tu primer producto'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
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
                {p.fk_cod_cat && (
                  <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm">
                    {categories.find(c => c.cod_cat === p.fk_cod_cat)?.nom_cat ?? 'Sin cat.'}
                  </span>
                )}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                  {p.tipos_prod?.map(t => {
                    const info = PRODUCT_LIST.find(x => x.id === t);
                    return (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-900/40 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-tighter shadow-sm border border-white/10">
                        {info?.icon} {t}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-[#111827] leading-tight flex-1">{p.nom_prod}</h3>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">#{p.cod_prod}</span>
                </div>
                {p.desc_prod && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.desc_prod}</p>}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-extrabold text-[#ec131e]">
                    ${safePrice(p.precio_prod).toLocaleString('es-CO')}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor(p) === 'text-red-500' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    Stock: {p.stock_actual ?? '—'}
                    {p.stock_minimo !== undefined && <span className="text-slate-400 font-normal"> / mín {p.stock_minimo}</span>}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStockModal({ product: p, mode: 'in', amount: 1 })}
                    className="flex-1 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-black transition-all"
                  >Gestionar Stock</button>
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-all"
                  >Editar</button>
                  <button
                    onClick={() => void handleDelete(p)}
                    className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-100 transition-all"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-extrabold text-[#111827]">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Imagen</label>
                <div
                  className="relative h-40 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#ec131e]/50 transition-colors overflow-hidden"
                  onClick={() => document.getElementById('img-upload')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400 text-sm">
                      <svg className="h-8 w-8 mx-auto mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>Click para subir imagen</span>
                    </div>
                  )}
                </div>
                <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                }} />
              </div>
              {([
                { label: 'Nombre *', key: 'nom_prod' as const, type: 'text' },
                { label: 'Descripción', key: 'desc_prod' as const, type: 'text' },
                { label: 'Precio *', key: 'precio_prod' as const, type: 'number' },
                { label: 'Stock actual', key: 'stock_actual' as const, type: 'number' },
                { label: 'Stock mínimo', key: 'stock_minimo' as const, type: 'number' },
              ] as { label: string; key: keyof CreateProductDto; type: string }[]).map(({ label, key, type }) => (
                <div key={key as string}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type="text"
                    inputMode={type === 'number' ? 'numeric' : 'text'}
                    value={String(form[key] ?? '')}
                    onChange={e => {
                      const val = type === 'number' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value;
                      setForm(f => ({ ...f, [key]: type === 'number' ? (val ? Number(val) : 0) : val }));
                    }}
                    onKeyDown={e => {
                      if (type === 'number' && !/[0-9]|Backspace|Delete|Arrow|Left|Right|Tab/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20"
                  />
                </div>
              ))}
              
              {/* Product Types (Multi-select) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipos de Producto (Varios)</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
                  {PRODUCT_LIST.map(t => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={form.tipos_prod?.includes(t.id)}
                          onChange={e => {
                            const newTipos = e.target.checked
                              ? [...(form.tipos_prod || []), t.id]
                              : (form.tipos_prod || []).filter(x => x !== t.id);
                            setForm(f => ({ ...f, tipos_prod: newTipos }));
                          }}
                          className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-200 checked:bg-[#ec131e] checked:border-[#ec131e] transition-all"
                        />
                        <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-[#ec131e] transition-colors">{t.icon} {t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Categoría / Tipo de Producto *</label>
                <select
                  required
                  value={form.fk_id_cat ?? ''}
                  onChange={e => setForm(f => ({ ...f, fk_id_cat: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20"
                >
                  <option value="">Sin categoría</option>
                  {Array.isArray(categories) && categories.map(c => <option key={c.cod_cat} value={c.cod_cat}>{c.nom_cat}</option>)}
                </select>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={() => void handleSave()} disabled={saving} className="flex-1 rounded-xl bg-[#ec131e] py-2.5 text-sm font-bold text-white hover:bg-[#d01019] disabled:opacity-60">
                {saving ? 'Guardando…' : (editing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setStockModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className={`p-4 text-center ${stockModal.mode === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${stockModal.mode === 'in' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {stockModal.mode === 'in' ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                )}
              </div>
              <h3 className="text-lg font-extrabold">Ajustar Inventario</h3>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{stockModal.product.nom_prod}</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Mode Selector */}
              <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                <button
                  onClick={() => setStockModal(s => s ? { ...s, mode: 'in' } : null)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${stockModal.mode === 'in' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >Entrada</button>
                <button
                  onClick={() => setStockModal(s => s ? { ...s, mode: 'out' } : null)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${stockModal.mode === 'out' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                >Salida</button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Cantidad a registrar</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={stockModal.amount}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setStockModal(s => s ? { ...s, amount: val ? Number(val) : 0 } : null);
                    }}
                    onKeyDown={e => { if (!/[0-9]|Backspace|Delete|Arrow|Tab/.test(e.key)) e.preventDefault(); }}
                    className={`w-full text-3xl font-black text-center py-4 rounded-2xl border-2 transition-all outline-none ${stockModal.mode === 'in' ? 'border-emerald-100 focus:border-emerald-500 text-emerald-700' : 'border-red-100 focus:border-red-500 text-red-700'} bg-slate-50`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold uppercase text-[10px]">unidades</div>
                </div>
                <div className="mt-3 flex justify-between px-1">
                  <span className="text-xs text-slate-400 font-medium tracking-tight">Stock actual: <span className="font-bold text-slate-600">{stockModal.product.stock_actual}</span></span>
                  <span className="text-xs text-slate-400 font-medium tracking-tight">Resultante: <span className={`font-bold ${stockModal.mode === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {(stockModal.product.stock_actual || 0) + (stockModal.mode === 'in' ? stockModal.amount : -stockModal.amount)}
                  </span></span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStockModal(null)} className="flex-1 rounded-2xl py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">Descartar</button>
                <button
                  onClick={() => void handleStockAdjust()}
                  className={`flex-[2] rounded-2xl py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${stockModal.mode === 'in' ? 'bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600' : 'bg-red-500 shadow-red-200 hover:bg-red-600'}`}
                >
                  Registrar {stockModal.mode === 'in' ? 'Entrada' : 'Salida'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Drawer */}
      {catDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCatDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-extrabold">Gestión de Categorías</h2>
              <button onClick={() => setCatDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Category list */}
              <div className="space-y-2 mb-6">
                {Array.isArray(categories) && categories.map(cat => (
                  <div key={cat.id_cat} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-bold text-sm text-[#111827]">{cat.nom_cat}</p>
                      {cat.desc_cat && <p className="text-xs text-slate-400">{cat.desc_cat}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingCat(cat); setCatForm({ nom_cat: cat.nom_cat, desc_cat: cat.desc_cat ?? '' }); }}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600"
                      >Editar</button>
                      <button
                        onClick={() => void handleDeleteCat(cat)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-red-500"
                      >Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Create / edit form */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <h3 className="text-sm font-bold text-slate-700">{editingCat ? 'Editar categoría' : 'Nueva categoría'}</h3>
                <input
                  type="text"
                  placeholder="Nombre *"
                  value={catForm.nom_cat}
                  onChange={e => setCatForm(f => ({ ...f, nom_cat: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={catForm.desc_cat}
                  onChange={e => setCatForm(f => ({ ...f, desc_cat: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                />
                <div className="flex gap-2">
                  {editingCat && (
                    <button onClick={() => { setEditingCat(null); setCatForm({ nom_cat: '', desc_cat: '' }); }} className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600">Cancelar</button>
                  )}
                  <button onClick={() => void handleSaveCat()} disabled={savingCat} className="flex-1 rounded-xl bg-[#ec131e] py-2 text-xs font-bold text-white disabled:opacity-60">
                    {savingCat ? 'Guardando…' : (editingCat ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
