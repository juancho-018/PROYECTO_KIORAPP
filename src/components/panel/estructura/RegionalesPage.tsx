import React, { useState, useEffect } from 'react';
import { storeService, alertService } from '@/config/setup';
import type { Regional } from '@/services/StoreService';

export const RegionalesPage: React.FC = () => {
  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Regional | null>(null);
  const [nombre, setNombre] = useState('');

  const loadRegionales = async () => {
    setLoading(true);
    try {
      const data = await storeService.getRegionales();
      setRegionales(data);
    } catch (err: any) {
      alertService.showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegionales();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    try {
      if (isEditing) {
        await storeService.updateRegional(isEditing.id, nombre);
        alertService.showSuccess('Éxito', 'Regional actualizada correctamente');
      } else {
        await storeService.createRegional(nombre);
        alertService.showSuccess('Éxito', 'Regional creada correctamente');
      }
      setNombre('');
      setIsEditing(null);
      loadRegionales();
    } catch (err: any) {
      alertService.showError('Error', err.message);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await alertService.showConfirm('¿Eliminar regional?', 'Esta acción no se puede deshacer.');
    if (!confirm) return;
    try {
      await storeService.deleteRegional(id);
      alertService.showSuccess('Éxito', 'Regional eliminada correctamente');
      loadRegionales();
    } catch (err: any) {
      alertService.showError('Error', err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-on-surface">Gestión de Regionales</h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Nombre de la Regional
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Ej. Centro, Norte, Sur..."
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => { setIsEditing(null); setNombre(''); }}
            className="px-6 py-2 bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            Cancelar
          </button>
        )}
      </form>

      {loading ? (
        <div className="py-8 text-center text-sm text-on-surface-variant flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          Cargando regionales...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface-container-highest border-b border-outline-variant/30">
              <tr>
                <th className="p-3 font-semibold text-on-surface w-16 text-center">ID</th>
                <th className="p-3 font-semibold text-on-surface">Nombre</th>
                <th className="p-3 font-semibold text-on-surface text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {regionales.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-on-surface-variant">No hay regionales registradas.</td>
                </tr>
              ) : (
                regionales.map(reg => (
                  <tr key={reg.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-3 text-on-surface-variant text-center">{reg.id}</td>
                    <td className="p-3 text-on-surface font-medium">{reg.nombre}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setIsEditing(reg); setNombre(reg.nombre); }}
                          className="p-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)}
                          className="p-1.5 rounded-lg bg-error-container/30 text-error hover:bg-error-container transition-colors"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
