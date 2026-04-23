import React, { useState, useEffect } from 'react';
import { inventoryService, productService, alertService } from '@/config/setup';
import type { Product } from '@/models/Product';
import type { Supplier } from '@/models/Inventory';

interface MovementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MovementDrawer: React.FC<MovementDrawerProps> = ({ isOpen, onClose, onSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    tipo_mov: 'entrada' as 'entrada' | 'salida',
    cod_prod: '',
    fk_cod_prov: '',
<<<<<<< HEAD
    cantidad: '',
    desc_mov: ''
=======
    cantidad: ''
>>>>>>> origin/develop
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [resProd, resSup] = await Promise.all([
        productService.getProducts(1, 100),
        inventoryService.getSuppliers()
      ]);
      const prodList = Array.isArray(resProd) ? resProd : (resProd?.data || []);
      setProducts(prodList);
      if (resSup?.data) setSuppliers(resSup.data);
    } catch (error) {
      console.error('Error cargando catálogos', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cod_prod || !formData.cantidad) {
      alertService.showToast('warning', 'Producto y cantidad son obligatorios');
      return;
    }
<<<<<<< HEAD
    if (!formData.desc_mov.trim()) {
      alertService.showToast('warning', 'La justificación es obligatoria');
      return;
    }
=======
>>>>>>> origin/develop

    setIsSaving(true);
    try {
      const res = await inventoryService.createMovement({
        tipo_mov: formData.tipo_mov,
        cod_prod: Number(formData.cod_prod),
        cantidad: Number(formData.cantidad),
<<<<<<< HEAD
        // @ts-ignore
        desc_mov: formData.desc_mov,
=======
>>>>>>> origin/develop
        fecha_mov: new Date().toISOString() as any
      }) as any;

      if (res.alerta_stock) {
        alertService.showWarning('Stock Crítico', res.mensaje_alerta || 'El stock bajó del mínimo');
      } else {
        alertService.showSuccess('Operación Exitosa', `Se registró la ${formData.tipo_mov} correctamente`);
      }

      onSuccess();
      window.dispatchEvent(new CustomEvent('kiora-refresh-alerts'));
      onClose();
<<<<<<< HEAD
      setFormData({ tipo_mov: 'entrada', cod_prod: '', fk_cod_prov: '', cantidad: '', desc_mov: '' });
=======
      setFormData({ tipo_mov: 'entrada', cod_prod: '', fk_cod_prov: '', cantidad: '' });
>>>>>>> origin/develop
    } catch (error: any) {
      alertService.showError('Error', error.message || 'No se pudo registrar el movimiento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-99999 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-100 max-w-full bg-[#fafafc] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-[15px] font-bold text-gray-800">Registrar Movimiento</h2>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="movementForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">Tipo de Movimiento</label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tipo_mov: 'entrada'})}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.tipo_mov === 'entrada' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Entrada (Ingreso)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, tipo_mov: 'salida'})}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.tipo_mov === 'salida' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                >
                  Salida (Baja/Ajuste)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">Producto</label>
              <select
                required
                value={formData.cod_prod}
                onChange={(e) => setFormData({...formData, cod_prod: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-sm bg-white"
              >
                <option value="">Seleccionar Producto...</option>
                {products.map(p => (
                  <option key={p.cod_prod} value={p.cod_prod}>{p.nom_prod} - (Stock: {p.stock_actual})</option>
                ))}
              </select>
            </div>

            {formData.tipo_mov === 'entrada' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">Proveedor (Opcional)</label>
                <select
                  value={formData.fk_cod_prov}
                  onChange={(e) => setFormData({...formData, fk_cod_prov: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-sm bg-white"
                >
                  <option value="">Desconocido / Directo</option>
                  {suppliers.map(s => (
                    <option key={s.cod_prov} value={s.cod_prov}>{s.nom_prov}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">Cantidad de Unidades</label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="Ej. 10"
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: e.target.value.replace(/\D/g, '')})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-lg font-bold"
              />
            </div>

<<<<<<< HEAD
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">Justificación / Origen</label>
              <input
                type="text"
                required
                placeholder="Ej. Compra a proveedor, merma, ajuste..."
                value={formData.desc_mov}
                onChange={(e) => setFormData({...formData, desc_mov: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-sm"
              />
            </div>

=======
>>>>>>> origin/develop
          </form>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-3">
          <button
            form="movementForm"
            type="submit"
            disabled={isSaving}
            className={`w-full font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${formData.tipo_mov === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-[#ec131e] hover:bg-[#d01019] text-white shadow-red-200'}`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                <span>Procesar {formData.tipo_mov === 'entrada' ? 'Ingreso' : 'Salida'}</span>
              </>
            )}
          </button>
          <button type="button" onClick={onClose} className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
