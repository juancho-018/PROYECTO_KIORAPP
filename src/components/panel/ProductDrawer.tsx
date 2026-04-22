import { useState, useEffect, useCallback } from 'react';
import type { Product, Category } from '@/models/Product';
import type { Movement } from '@/models/Inventory';
import { productService, inventoryService, alertService } from '@/config/setup';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
  categories: Category[];
  movements: Movement[];
  loadingMovements: boolean;
  onSave: (product: any, isEdit: boolean) => Promise<void>;
  onSaveMovement: (movement: any) => Promise<void>;
  onLoadMovements: (productId: number) => Promise<void>;
}

const EMPTY_PRODUCT = {
  nom_prod: '',
  desc_prod: '',
  precio_prod: 0,
  stock_actual: 0,
  stock_minimo: 0,
  fk_cod_cats: [] as number[],
  tipo_prod: 'alimento',
};

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';
const IMG_BASE = API_URL.replace('/api', '');

function getImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('data:')) return path;
  const cleanBase = IMG_BASE.endsWith('/') ? IMG_BASE.slice(0, -1) : IMG_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export function ProductDrawer({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess,
  categories,
  movements,
  loadingMovements,
  onSave,
  onSaveMovement,
  onLoadMovements
}: ProductDrawerProps) {
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Stock Movements state
  const [activeTab, setActiveTab] = useState<'info' | 'stock'>('info');
  const [movForm, setMovForm] = useState<{ tipo_mov: 'entrada' | 'salida'; cantidad_mov: number; desc_mov: string }>({
    tipo_mov: 'entrada',
    cantidad_mov: 1,
    desc_mov: ''
  });
  const [savingMov, setSavingMov] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        nom_prod: product.nom_prod || '',
        desc_prod: product.desc_prod || '',
        precio_prod: product.precio_prod || 0,
        stock_actual: product.stock_actual || 0,
        stock_minimo: product.stock_minimo || 0,
        fk_cod_cats: product.fk_cod_cats || [],
        tipo_prod: product.tipo_prod || 'alimento',
      });
      setImagePreview(product.imagen_prod ? getImageUrl(product.imagen_prod) : null);
    } else {
      setForm(EMPTY_PRODUCT);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'stock' && product?.cod_prod) {
      void onLoadMovements(product.cod_prod);
    }
  }, [activeTab, product?.cod_prod, onLoadMovements]);

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.cod_prod) return;
    if (movForm.cantidad_mov <= 0) return alertService.showToast('warning', 'La cantidad debe ser mayor a 0');

    // Check stock if 'salida'
    if (movForm.tipo_mov === 'salida' && movForm.cantidad_mov > (product.stock_actual || 0)) {
      return alertService.showToast('error', 'No hay stock suficiente para esta salida');
    }

    setSavingMov(true);
    try {
      await onSaveMovement({
        tipo_mov: movForm.tipo_mov,
        cantidad: movForm.cantidad_mov,
        desc_mov: movForm.desc_mov,
        cod_prod: product.cod_prod,
      });
      setMovForm({ tipo_mov: 'entrada', cantidad_mov: 1, desc_mov: '' });
    } finally {
      setSavingMov(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom_prod.trim()) return alertService.showToast('warning', 'El nombre es obligatorio');
    if (form.precio_prod <= 0) return alertService.showToast('warning', 'El precio debe ser mayor a 0');

    setSaving(true);
    try {
      const dto = {
        ...form,
        imagen: imageFile || undefined,
      };

      await onSave(dto, !!product?.cod_prod);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{product ? 'Editar Producto' : 'Crear Producto'}</h2>
            <p className="text-xs text-slate-500 font-medium">Completa la información técnica básica.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {product && (
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'info' ? 'border-b-2 border-[#ec131e] text-[#ec131e]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'stock' ? 'border-b-2 border-[#ec131e] text-[#ec131e]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Movimientos (Stock)
            </button>
          </div>
        )}

        {activeTab === 'info' ? (
          <form id="productForm" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Imagen del Producto</label>
              <div className="relative group aspect-video rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden transition-all hover:border-[#ec131e]/30">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="h-full w-full object-contain p-4" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="mt-2 text-xs font-bold text-slate-500">Haz clic para subir o arrastra</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={form.nom_prod}
                  onChange={e => setForm(f => ({ ...f, nom_prod: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[#ec131e] focus:outline-none focus:ring-4 focus:ring-[#ec131e]/5 transition-all"
                  placeholder="Ej. Takis Fuego 200g"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción</label>
                <textarea
                  value={form.desc_prod}
                  onChange={e => setForm(f => ({ ...f, desc_prod: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[#ec131e] focus:outline-none focus:ring-4 focus:ring-[#ec131e]/5 transition-all min-h-[100px]"
                  placeholder="Breve descripción del producto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Producto</label>
                  <select
                    value={form.tipo_prod}
                    onChange={e => setForm(f => ({ ...f, tipo_prod: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[#ec131e] focus:outline-none focus:ring-4 focus:ring-[#ec131e]/5 transition-all"
                  >
                    <option value="alimento">Alimento</option>
                    <option value="bebida">Bebida</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Precio ($) *</label>
                  <input
                    type="number"
                    required
                    value={form.precio_prod}
                    onChange={e => setForm(f => ({ ...f, precio_prod: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[#ec131e] focus:outline-none focus:ring-4 focus:ring-[#ec131e]/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categorías (Selección Múltiple)</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c.cod_cat}
                      type="button"
                      onClick={() => {
                        const id = c.cod_cat!;
                        setForm(f => ({
                          ...f,
                          fk_cod_cats: f.fk_cod_cats?.includes(id)
                            ? f.fk_cod_cats.filter(t => t !== id)
                            : [...(f.fk_cod_cats || []), id]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize border ${form.fk_cod_cats?.includes(c.cod_cat!)
                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {c.nom_cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Actual</label>
                  <input
                    type="number"
                    value={form.stock_actual}
                    disabled={!!product} // Disable if editing, must use movements
                    onChange={e => setForm(f => ({ ...f, stock_actual: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[#ec131e] focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Mínimo</label>
                  <input
                    type="number"
                    value={form.stock_minimo}
                    onChange={e => setForm(f => ({ ...f, stock_minimo: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[#ec131e] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {/* Movimientos form */}
            <form onSubmit={handleSaveMovement} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800">Registrar Movimiento</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</label>
                  <select
                    value={movForm.tipo_mov}
                    onChange={e => setMovForm(f => ({ ...f, tipo_mov: e.target.value as 'entrada' | 'salida' }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#ec131e] focus:outline-none"
                  >
                    <option value="entrada">Entrada (+)</option>
                    <option value="salida">Salida (-)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cantidad</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={movForm.cantidad_mov}
                    onChange={e => setMovForm(f => ({ ...f, cantidad_mov: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#ec131e] focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Justificación / Origen</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra a proveedor, merma, ajuste..."
                  value={movForm.desc_mov}
                  onChange={e => setMovForm(f => ({ ...f, desc_mov: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#ec131e] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={savingMov}
                className="w-full rounded-xl bg-[#111827] py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition-all active:scale-95"
              >
                {savingMov ? 'Registrando...' : 'Registrar'}
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-800">Historial de Movimientos</h3>
              {loadingMovements ? (
                <div className="flex justify-center py-5">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#ec131e]" />
                </div>
              ) : movements.length === 0 ? (
                <div className="text-center p-5 bg-white border border-slate-100 rounded-3xl">
                  <p className="text-xs text-slate-400 font-bold">No hay movimientos registrados.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {movements.map((m) => (
                    <div key={m.id_mov} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${m.tipo_mov === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {m.tipo_mov}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{m.fecha_mov ? new Date(m.fecha_mov).toLocaleDateString() : '—'}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600">{(m as any).desc_mov || 'Sin justificación'}</p>
                      </div>
                      <span className={`text-base font-black ${m.tipo_mov === 'entrada' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {m.tipo_mov === 'entrada' ? '+' : '-'}{m.cantidad || (m as any).cantidad_mov}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 p-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all font-[Inter]"
          >
            {activeTab === 'stock' ? 'Cerrar' : 'Cancelar'}
          </button>
          {activeTab === 'info' && (
            <button
              type="submit"
              form="productForm"
              disabled={saving}
              className="flex-1 rounded-2xl bg-[#ec131e] py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[#ec131e]/20 hover:bg-[#d01019] hover:shadow-[#ec131e]/30 disabled:opacity-60 transition-all active:scale-95 font-[Inter]"
            >
              {saving ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
