import React, { useEffect, useState } from 'react';
import type { Product, Category } from '@/models/Product';
import { productService } from '@/config/setup';

interface ProductDrawerProps {
  isOpen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  productData: Partial<Product>;
  onProductDataChange: (data: Partial<Product>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  isOpen,
  isEditing,
  isSaving,
  productData,
  onProductDataChange,
  onSubmit,
  onClose
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isOpen) {
      productService.getCategories().then(res => {
        if(res && res.data) setCategories(res.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-[99999] transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-100 max-w-[calc(100vw-1rem)] bg-[#fafafc] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-[15px] font-bold text-gray-800">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <form onSubmit={onSubmit} id="productForm" className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600">Nombre del Producto</label>
              <input 
                type="text" 
                required
                value={productData.nom_prod || ''}
                onChange={(e) => onProductDataChange({...productData, nom_prod: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                placeholder="Ej. Papas Margarita Limón" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600">Descripción (Opcional)</label>
              <textarea 
                value={productData.descrip_prod || ''}
                onChange={(e) => onProductDataChange({...productData, descrip_prod: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300 resize-none min-h-[80px]" 
                placeholder="Detalles del producto..." 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600">Precio Unitario ($)</label>
              <input 
                type="text" 
                inputMode="numeric"
                required
                value={productData.precio_unitario || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  onProductDataChange({...productData, precio_unitario: val ? Number(val) : 0});
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                placeholder="3500" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600">Categoría</label>
              <div className="relative">
                <select 
                  required
                  value={productData.fk_cod_cat || ''}
                  onChange={(e) => onProductDataChange({...productData, fk_cod_cat: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white text-gray-700 appearance-none cursor-pointer" 
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.cod_cat} value={cat.cod_cat}>{cat.nom_cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-600">Stock Actual</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={productData.stock_actual || 0}
                  onChange={(e) => onProductDataChange({...productData, stock_actual: Number(e.target.value.replace(/\D/g, ''))})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                  placeholder="0" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-600">Stock Mínimo</label>
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={productData.stock_minimo || 0}
                  onChange={(e) => onProductDataChange({...productData, stock_minimo: Number(e.target.value.replace(/\D/g, ''))})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                  placeholder="5" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600">Fecha de Vencimiento (Opcional)</label>
              <input 
                type="date" 
                value={productData.fechaven_prod ? String(productData.fechaven_prod).split('T')[0] : ''}
                onChange={(e) => onProductDataChange({...productData, fechaven_prod: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white text-gray-700" 
              />
            </div>
          </form>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-3">
          <button 
             form="productForm" 
             type="submit" 
             disabled={isSaving}
             className="w-full bg-[#ec131e] hover:bg-[#d01019] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(236,19,30,0.39)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
              </>
            )}
          </button>
          <button 
             type="button" 
             disabled={isSaving}
             onClick={onClose} 
             className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-3.5 rounded-xl border border-gray-200 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
