import React, { useState, useEffect, useRef } from 'react';
import { productService, alertService } from '@/config/setup';
import type { Product, CreateProductDto } from '@/models/Product';
import type { Category } from '@/models/Category';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onOpenCategoryDrawer?: () => void;
}

export function ProductDrawer({ isOpen, onClose, product, categories: rawCategories, onSuccess, onOpenCategoryDrawer }: ProductDrawerProps) {
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  
  const [formData, setFormData] = useState<Partial<CreateProductDto>>({
    nom_prod: '',
    descrip_prod: '',
    precio_unitario: 0,
    stock_actual: 0,
    stock_minimo: 0,
    fk_cod_cat: undefined
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        nom_prod: product.nom_prod,
        descrip_prod: product.descrip_prod || '',
        precio_unitario: product.precio_unitario,
        stock_actual: product.stock_actual,
        stock_minimo: product.stock_minimo,
        fk_cod_cat: product.fk_cod_cat || undefined
      });
      setImagePreview(product.url_imagen || null);
    } else {
      setFormData({
        nom_prod: '',
        descrip_prod: '',
        precio_unitario: 0,
        stock_actual: 0,
        stock_minimo: 0,
        fk_cod_cat: categories.length > 0 ? categories[0].cod_cat : undefined
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [product, isOpen, categories]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom_prod || !formData.precio_unitario) {
      alertService.showToast('warning', 'Nombre y precio son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const dto: any = { ...formData };
      if (imageFile) dto.imagen = imageFile;

      if (product) {
        delete dto.stock_actual;
        await productService.updateProduct(product.cod_prod, dto);
        alertService.showToast('success', 'Producto actualizado');
      } else {
        await productService.createProduct(dto as CreateProductDto);
        alertService.showToast('success', 'Producto creado');
      }
      onSuccess();
      onClose();
    } catch (error) {
      alertService.showToast('error', getErrorMessage(error, 'Error al guardar producto'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition-colors">
               <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Imagen del Producto</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-[#ec131e] hover:bg-red-50/10 group"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Cambiar Imagen</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-2">
                  <div className="rounded-full bg-white p-3 shadow-sm text-slate-400 group-hover:text-[#ec131e] transition-colors">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subir Imagen</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nombre del Producto</label>
              <input
                type="text"
                required
                value={formData.nom_prod}
                onChange={(e) => setFormData({ ...formData, nom_prod: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm"
                placeholder="Ej: Croissant de Almendras"
              />
            </div>

              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Categoría</label>
                {!categories || categories.length === 0 ? (
                  <button 
                    type="button"
                    onClick={onOpenCategoryDrawer}
                    className="text-[10px] font-bold text-[#ec131e] hover:underline"
                  >
                    + Crear Nueva
                  </button>
                ) : null}
              </div>
              <select
                value={formData.fk_cod_cat || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, fk_cod_cat: isNaN(val) ? undefined : val });
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm appearance-none"
              >
                <option value="" disabled>Seleccionar categoría...</option>
                {categories.map(cat => (
                  <option key={cat.cod_cat} value={cat.cod_cat}>{cat.nom_cat}</option>
                ))}
              </select>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Precio Unitario</label>
                <input
                  type="number"
                  required
                  value={formData.precio_unitario === 0 || isNaN(formData.precio_unitario as number) ? '' : formData.precio_unitario}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    setFormData({ ...formData, precio_unitario: isNaN(val) ? 0 : val });
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {product ? 'Stock actual (solo lectura)' : 'Stock Inicial'}
                </label>
                <input
                  type="number"
                  required={!product}
                  disabled={!!product}
                  value={formData.stock_actual === 0 || isNaN(formData.stock_actual as number) ? '' : formData.stock_actual}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                    setFormData({ ...formData, stock_actual: isNaN(val) ? 0 : val });
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm disabled:cursor-not-allowed disabled:bg-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {product && (
                  <p className="text-[10px] font-medium text-slate-500">
                    Para cambiar stock usa el boton "Ajustar inventario" en la tarjeta del producto.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                required
                value={formData.stock_minimo === 0 || isNaN(formData.stock_minimo as number) ? '' : formData.stock_minimo}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  setFormData({ ...formData, stock_minimo: isNaN(val) ? 0 : val });
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descripción</label>
              <textarea
                value={formData.descrip_prod}
                onChange={(e) => setFormData({ ...formData, descrip_prod: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm resize-none"
                placeholder="Breve descripción del producto..."
              />
            </div>
          </div>
        </form>

        <footer className="p-6 border-t border-slate-100 bg-white">
          <button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full rounded-2xl bg-[#ec131e] py-4 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : product ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
        </footer>
      </div>
    </div>
  );
}
