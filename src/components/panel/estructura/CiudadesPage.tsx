import React, { useState, useEffect } from 'react';
import { storeService, alertService } from '@/config/setup';
import type { Ciudad, Regional } from '@/services/StoreService';

export const CiudadesPage: React.FC = () => {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState<Ciudad | null>(null);
  const [nombre, setNombre] = useState('');
  const [regionalId, setRegionalId] = useState<number | ''>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ciudadesData, regionalesData] = await Promise.all([
        storeService.getCiudades(),
        storeService.getRegionales(),
      ]);
      setCiudades(ciudadesData);
      setRegionales(regionalesData);
    } catch (err: any) {
      alertService.showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || regionalId === '') return;
    try {
      if (isEditing) {
        await storeService.updateCiudad(isEditing.id, { nombre, fk_regional_id: regionalId });
        alertService.showSuccess('Éxito', 'Ciudad actualizada correctamente');
      } else {
        await storeService.createCiudad(nombre, regionalId);
        alertService.showSuccess('Éxito', 'Ciudad creada correctamente');
      }
      setNombre('');
      setRegionalId('');
      setIsEditing(null);
      loadData();
    } catch (err: any) {
      alertService.showError('Error', err.message);
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await alertService.showConfirm('¿Eliminar ciudad?', 'Esta acción no se puede deshacer.');
    if (!confirm) return;
    try {
      await storeService.deleteCiudad(id);
      alertService.showSuccess('Éxito', 'Ciudad eliminada correctamente');
      loadData();
    } catch (err: any) {
      alertService.showError('Error', err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-on-surface">Gestión de Ciudades</h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Nombre de la Ciudad
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            placeholder="Ej. Bogotá, Medellín..."
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            Regional
          </label>
          <select
            value={regionalId}
            onChange={(e) => setRegionalId(Number(e.target.value))}
            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            required
          >
            <option value="" disabled>Seleccione una regional</option>
            {regionales.map(reg => (
              <option key={reg.id} value={reg.id}>{reg.nombre}</option>
            ))}
          </select>
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
            onClick={() => { setIsEditing(null); setNombre(''); setRegionalId(''); }}
            className="px-6 py-2 bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            Cancelar
          </button>
        )}
      </form>

      {loading ? (
        <div className="py-8 text-center text-sm text-on-surface-variant flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          Cargando ciudades...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface-container-highest border-b border-outline-variant/30">
              <tr>
                <th className="p-3 font-semibold text-on-surface w-16 text-center">ID</th>
                <th className="p-3 font-semibold text-on-surface">Nombre</th>
                <th className="p-3 font-semibold text-on-surface">Regional</th>
                <th className="p-3 font-semibold text-on-surface text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ciudades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-on-surface-variant">No hay ciudades registradas.</td>
                </tr>
              ) : (
                ciudades.map(c => (
                  <tr key={c.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-3 text-on-surface-variant text-center">{c.id}</td>
                    <td className="p-3 text-on-surface font-medium">{c.nombre}</td>
                    <td className="p-3 text-on-surface-variant">
                      <span className="px-2 py-1 bg-surface-container-high rounded-lg text-xs font-medium">
                        {c.regional_nombre || `ID: ${c.fk_regional_id}`}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setIsEditing(c); setNombre(c.nombre); setRegionalId(c.fk_regional_id); }}
                          className="p-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
