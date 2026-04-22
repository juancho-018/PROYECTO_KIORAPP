import React, { useState } from 'react';
import { productService, alertService } from '@/config/setup';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryModal({ isOpen, onClose, onSuccess }: CategoryModalProps) {
  const [nomCat, setNomCat] = useState('');
  const [descCat, setDescCat] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCat.trim()) {
      alertService.showToast('warning', 'El nombre es obligatorio');
      return;
    }
    setIsSaving(true);
    try {
      await productService.createCategory({ nom_cat: nomCat, descrip_cat: descCat });
      alertService.showToast('success', 'Categoría creada con éxito');
      setNomCat('');
      setDescCat('');
      onSuccess();
      onClose();
    } catch (error) {
      alertService.showToast('error', 'Error al crear la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-800">Nueva Categoría</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nombre</label>
            <input
              type="text"
              required
              value={nomCat}
              onChange={(e) => setNomCat(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:bg-white focus:outline-none"
              placeholder="Ej: Lácteos"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Descripción (Opcional)</label>
            <textarea
              rows={2}
              value={descCat}
              onChange={(e) => setDescCat(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:bg-white focus:outline-none resize-none"
              placeholder="Ej: Productos derivados de la leche"
            />
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-4 flex items-center justify-center rounded-xl bg-[#ec131e] py-3 text-sm font-bold text-white transition-all hover:bg-[#d01019] disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Crear Categoría'}
          </button>
        </form>
      </div>
    </div>
  );
}
