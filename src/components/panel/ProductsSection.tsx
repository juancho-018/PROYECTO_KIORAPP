import { useState, useEffect, useCallback } from 'react';
import { productService, alertService } from '@/config/setup';
import type { Product, Category } from '@/models/Product';
import type { CreateProductDto } from '@/services/ProductService';
import { getErrorMessage } from '@/utils/getErrorMessage';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
const IMG_BASE = API_URL.replace('/api', '');

function getImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMG_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

const EMPTY_FORM: CreateProductDto = {
  nom_prod: '',
  desc_prod: '',
  precio_prod: 0,
  stock_actual: 0,
  stock_minimo: 0,
  fk_id_cat: undefined,
};

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<number | ''>('');

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Stock modal
  const [stockModal, setStockModal] = useState<{ product: Product; delta: number } | null>(null);

  // Category drawer
  const [catDrawerOpen, setCatDrawerOpen] = useState(false);
  const [catForm, setCatForm] = useState({ nom_cat: '', desc_cat: '' });
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [savingCat, setSavingCat] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar productos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = products.filter(p => {
    const matchSearch = !search || (p.nom_prod || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === '' || p.fk_id_cat === filterCat;
    return matchSearch && matchCat;
  });

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
      fk_id_cat: p.fk_id_cat,
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
    try {
      await productService.updateStock(stockModal.product.cod_prod!, stockModal.delta);
      alertService.showToast('success', 'Stock actualizado');
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
      if (editingCat?.id_cat) {
        await productService.updateCategory(editingCat.id_cat, catForm.nom_cat, catForm.desc_cat);
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
    if (!ok || !cat.id_cat) return;
    try {
      await productService.deleteCategory(cat.id_cat);
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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Buscar producto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value === '' ? '' : Number(e.target.value))}
          className="rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id_cat} value={c.id_cat}>{c.nom_cat}</option>)}
        </select>
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
          <p className="text-sm">Agrega tu primer producto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <div key={p.cod_prod} className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
              {p.imagen_prod && (
                <div className="mb-4 h-40 w-full overflow-hidden rounded-xl bg-slate-50">
                  <img src={getImageUrl(p.imagen_prod)} alt={p.nom_prod} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-[#111827] leading-tight">{p.nom_prod}</h3>
                {p.fk_id_cat && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {categories.find(c => c.id_cat === p.fk_id_cat)?.nom_cat ?? 'Sin cat.'}
                  </span>
                )}
              </div>
              {p.desc_prod && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{p.desc_prod}</p>}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-extrabold text-[#ec131e]">${Number(p.precio_prod).toFixed(2)}</span>
                <span className={`text-sm font-bold ${statusColor(p)}`}>
                  Stock: {p.stock_actual ?? '—'}
                  {p.stock_minimo !== undefined && <span className="text-slate-400 font-normal"> / mín {p.stock_minimo}</span>}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStockModal({ product: p, delta: 0 })}
                  className="flex-1 rounded-lg bg-slate-100 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all"
                >Ajustar stock</button>
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 rounded-lg bg-blue-50 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-all"
                >Editar</button>
                <button
                  onClick={() => void handleDelete(p)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-100 transition-all"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
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
                    type={type}
                    value={String(form[key] ?? '')}
                    onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Categoría</label>
                <select
                  value={form.fk_id_cat ?? ''}
                  onChange={e => setForm(f => ({ ...f, fk_id_cat: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id_cat} value={c.id_cat}>{c.nom_cat}</option>)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setStockModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold mb-1">Ajustar Stock</h3>
            <p className="text-sm text-slate-500 mb-4">{stockModal.product.nom_prod} — Actual: <strong>{stockModal.product.stock_actual}</strong></p>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cantidad (positivo = entrada, negativo = salida)</label>
            <input
              type="number"
              value={stockModal.delta}
              onChange={e => setStockModal(s => s ? { ...s, delta: Number(e.target.value) } : null)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none focus:ring-2 focus:ring-[#ec131e]/20 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setStockModal(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={() => void handleStockAdjust()} className="flex-1 rounded-xl bg-[#ec131e] py-2.5 text-sm font-bold text-white hover:bg-[#d01019]">Confirmar</button>
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
                {categories.map(cat => (
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
