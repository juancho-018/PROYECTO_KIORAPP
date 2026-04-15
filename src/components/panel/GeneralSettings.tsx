import React, { useState } from 'react';
import { alertService } from '../../config/setup';

export const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    storeName: 'Kiora Coffee & Food',
    currency: 'COP',
    address: 'Calle Falsa 123, Bogotá',
    phone: '+57 300 000 0000',
    lowStockThreshold: 5
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alertService.showToast('success', 'Configuración guardada correctamente');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-slate-50 pb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ec131e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Información de la Tienda
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Nombre del Establecimiento</label>
              <input 
                type="text" 
                value={settings.storeName}
                onChange={e => setSettings({...settings, storeName: e.target.value})}
                className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 transition-all font-[Inter]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Dirección Física</label>
              <input 
                type="text" 
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
                className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-100 transition-all font-[Inter]"
              />
            </div>
          </div>
        </div>

        {/* Operational Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-slate-50 pb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Parámetros de Operación
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Moneda del Sistema</label>
              <select 
                value={settings.currency}
                onChange={e => setSettings({...settings, currency: e.target.value})}
                className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all font-[Inter]"
              >
                <option value="COP">COP ($) - Pesos Colombianos</option>
                <option value="USD">USD ($) - Dólares Americanos</option>
                <option value="MXN">MXN ($) - Pesos Mexicanos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Umbral Stock Bajo (Alerta Global)</label>
              <input 
                type="number" 
                value={settings.lowStockThreshold}
                onChange={e => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border-none px-4 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-100 transition-all font-[Inter]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#ec131e] hover:bg-[#d01019] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};
