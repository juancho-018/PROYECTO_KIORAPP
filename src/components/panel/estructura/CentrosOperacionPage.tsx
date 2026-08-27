import React, { useState, useEffect } from 'react';
import { storeService, alertService } from '@/config/setup';
import type { Tienda, Ciudad, Regional } from '@/services/StoreService';

export const CentrosOperacionPage: React.FC = () => {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState<Tienda | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    fk_ciudad_id: '' as number | '',
  });

  const [selectedRegional, setSelectedRegional] = useState<number | ''>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tiendasData, ciudadesData, regionalesData] = await Promise.all([
        storeService.getStores(),
        storeService.getCiudades(),
        storeService.getRegionales(),
      ]);
      setTiendas(tiendasData);
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
    if (!formData.nombre.trim() || !formData.direccion.trim() || formData.fk_ciudad_id === '') return;
    
    try {
      if (isEditing) {
        await storeService.updateStore(isEditing.id_tienda, {
          nombre: formData.nombre,
          direccion: formData.direccion,
          telefono: formData.telefono,
          fk_ciudad_id: formData.fk_ciudad_id,
        });
        alertService.showSuccess('Éxito', 'Tienda actualizada correctamente');
      } else {
        await storeService.createStore({
          nombre: formData.nombre,
          direccion: formData.direccion,
          telefono: formData.telefono,
          fk_ciudad_id: formData.fk_ciudad_id,
        });
        alertService.showSuccess('Éxito', 'Tienda creada correctamente');
      }
      resetForm();
      loadData();
    } catch (err: any) {
      alertService.showError('Error', err.message);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', direccion: '', telefono: '', fk_ciudad_id: '' });
    setSelectedRegional('');
    setIsEditing(null);
  };

  const handleEdit = (t: Tienda) => {
    setIsEditing(t);
    setFormData({
      nombre: t.nombre,
      direccion: t.direccion,
      telefono: t.telefono || '',
      fk_ciudad_id: t.fk_ciudad_id || '',
    });
    // Find regional of the ciudad to set the first select
    if (t.fk_ciudad_id) {
      const ciudad = ciudades.find(c => c.id === t.fk_ciudad_id);
      if (ciudad) setSelectedRegional(ciudad.fk_regional_id);
    }
  };

  const ciudadesOptions = selectedRegional 
    ? ciudades.filter(c => c.fk_regional_id === selectedRegional)
    : ciudades;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-on-surface">Gestión de Tiendas (CO)</h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Nombre de Tienda
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary outline-none"
            placeholder="Ej. Sede Principal"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary outline-none"
            placeholder="Ej. Calle 123 #45-67"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Teléfono (opcional)
          </label>
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary outline-none"
            placeholder="Ej. +57 300 000 0000"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Regional (Filtro)
          </label>
          <select
            value={selectedRegional}
            onChange={(e) => {
              setSelectedRegional(Number(e.target.value));
              setFormData({ ...formData, fk_ciudad_id: '' });
            }}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary outline-none"
          >
            <option value="">Todas las regionales</option>
            {regionales.map(reg => (
              <option key={reg.id} value={reg.id}>{reg.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Ciudad *
          </label>
          <select
            value={formData.fk_ciudad_id}
            onChange={(e) => setFormData({ ...formData, fk_ciudad_id: Number(e.target.value) })}
            className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-2 text-sm focus:border-primary outline-none"
            required
          >
            <option value="" disabled>Seleccione una ciudad</option>
            {ciudadesOptions.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 lg:col-span-1">
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="py-8 text-center text-sm text-on-surface-variant flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          Cargando tiendas...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface-container-highest border-b border-outline-variant/30">
              <tr>
                <th className="p-3 font-semibold text-on-surface w-16 text-center">ID</th>
                <th className="p-3 font-semibold text-on-surface">Nombre</th>
                <th className="p-3 font-semibold text-on-surface">Dirección</th>
                <th className="p-3 font-semibold text-on-surface">Ubicación</th>
                <th className="p-3 font-semibold text-on-surface text-center">Estado</th>
                <th className="p-3 font-semibold text-on-surface text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiendas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-on-surface-variant">No hay tiendas registradas.</td>
                </tr>
              ) : (
                tiendas.map(t => (
                  <tr key={t.id_tienda} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="p-3 text-on-surface-variant text-center">{t.id_tienda}</td>
                    <td className="p-3 text-on-surface font-medium">{t.nombre}</td>
                    <td className="p-3 text-on-surface-variant">{t.direccion}</td>
                    <td className="p-3 text-on-surface-variant">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface text-xs">{t.ciudad_nombre || 'Sin ciudad'}</span>
                        <span className="text-[10px] text-on-surface-variant">{t.regional_nombre || '-'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wide ${
                        t.estado === 'ABIERTO' ? 'bg-emerald-100 text-emerald-800' :
                        t.estado === 'CERRADO' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {t.estado}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleEdit(t)}
                        className="p-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
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
