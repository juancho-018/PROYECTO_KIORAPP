import React, { useState, useEffect } from 'react';
import { productService, alertService } from '@/config/setup';
import type { Category, CreateCategoryDto } from '@/models/Category';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: () => void;
}

export function CategoryDrawer({ isOpen, onClose, category, onSuccess }: CategoryDrawerProps) {
  const [formData, setFormData] = useState<CreateCategoryDto>({
    nom_cat: '',
    descrip_cat: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        nom_cat: category.nom_cat,
        descrip_cat: category.descrip_cat || ''
      });
    } else {
      setFormData({ nom_cat: '', descrip_cat: '' });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom_cat) {
      alertService.showToast('warning', 'El nombre es obligatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      if (category) {
        await productService.updateCategory(category.cod_cat, formData);
        alertService.showToast('success', 'Categoría actualizada');
      } else {
        await productService.createCategory(formData);
        alertService.showToast('success', 'Categoría creada');
      }
      onSuccess();
      onClose();
    } catch (error) {
      alertService.showToast('error', getErrorMessage(error, 'Error al guardar categoría'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full bg-[#fdfcfb]">
          <header className="p-6 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {category ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 transition-colors">
                 <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#3E2723]/60">Nombre de la Categoría</label>
              <input
                type="text"
                required
                value={formData.nom_cat}
                onChange={(e) => setFormData({ ...formData, nom_cat: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm"
                placeholder="Ej: Pastelería, Bebidas..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#3E2723]/60">Descripción (Opcional)</label>
              <textarea
                value={formData.descrip_cat}
                onChange={(e) => setFormData({ ...formData, descrip_cat: e.target.value })}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#ec131e] focus:outline-none transition-all shadow-sm resize-none"
                placeholder="Breve descripción de la categoría..."
              />
            </div>
          </form>

          <footer className="p-6 border-t border-slate-100 bg-white">
            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-[#ec131e] py-4 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : category ? 'Actualizar Categoría' : 'Crear Categoría'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
