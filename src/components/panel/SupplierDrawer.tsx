import React, { useState, useEffect } from 'react';
import type { Supplier, CreateSupplierDto } from '@/models/Inventory';
import { alertService } from '@/config/setup';

interface SupplierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSuccess: () => void;
  onSubmit: (id: number | null, data: CreateSupplierDto) => Promise<void>;
}

export const SupplierDrawer: React.FC<SupplierDrawerProps> = ({ 
  isOpen, 
  onClose, 
  supplier, 
  onSuccess,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateSupplierDto>({
    nom_prov: '',
    id_prov: '',
    tel_prov: '',
    tipoid_prov: 'NIT'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          nom_prov: supplier.nom_prov,
          id_prov: supplier.id_prov || '',
          tel_prov: supplier.tel_prov || '',
          tipoid_prov: supplier.tipoid_prov || 'NIT'
        });
      } else {
        setFormData({
          nom_prov: '',
          id_prov: '',
          tel_prov: '',
          tipoid_prov: 'NIT'
        });
      }
    }
  }, [isOpen, supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom_prov.trim()) {
      alertService.showToast('warning', 'El nombre es obligatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(supplier?.cod_prov || null, formData);
      alertService.showToast('success', `Proveedor ${supplier ? 'actualizado' : 'creado'} correctamente`);
      onSuccess();
      onClose();
    } catch (error) {
      // Error handled by parent or service
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500" 
        onClick={onClose}
      />

      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-500">
        <header className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Completa la información del socio comercial.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Nombre Comercial</label>
              <input
                type="text"
                required
                value={formData.nom_prov}
                onChange={(e) => setFormData(prev => ({ ...prev, nom_prov: e.target.value }))}
                placeholder="Ej: Distribuidora Central S.A."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ec131e]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tipo ID</label>
                  <select
                    value={formData.tipoid_prov}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoid_prov: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ec131e]"
                  >
                    <option value="NIT">NIT</option>
                    <option value="CC">Cédula</option>
                    <option value="RUT">RUT</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Identificación</label>
                  <input
                    type="text"
                    value={formData.id_prov}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_prov: e.target.value }))}
                    placeholder="900.123.456-1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ec131e]"
                  />
               </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Teléfono de contacto</label>
              <input
                type="tel"
                value={formData.tel_prov}
                onChange={(e) => setFormData(prev => ({ ...prev, tel_prov: e.target.value }))}
                placeholder="+57 321 000 0000"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ec131e]"
              />
            </div>
          </div>
        </form>

        <footer className="p-8 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#ec131e] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : (supplier ? 'Actualizar Proveedor' : 'Crear Proveedor')}
          </button>
        </footer>
      </div>
    </div>
  );
};
