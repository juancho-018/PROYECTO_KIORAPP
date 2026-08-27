import React, { useState } from 'react';
import { RegionalesPage } from './RegionalesPage';
import { CiudadesPage } from './CiudadesPage';
import { CentrosOperacionPage } from './CentrosOperacionPage';

type Tab = 'regionales' | 'ciudades' | 'tiendas';

export const EstructuraSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('regionales');

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Estructura Organizacional</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestiona la jerarquía de la empresa: Regionales, Ciudades y Tiendas.
          </p>
        </div>
      </div>

      <div className="flex bg-surface-container-low p-1 rounded-xl w-fit mb-6 shadow-sm border border-outline-variant/30">
        <button
          onClick={() => setActiveTab('regionales')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'regionales'
              ? 'bg-primary text-on-primary shadow'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          Regionales
        </button>
        <button
          onClick={() => setActiveTab('ciudades')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'ciudades'
              ? 'bg-primary text-on-primary shadow'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          Ciudades
        </button>
        <button
          onClick={() => setActiveTab('tiendas')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'tiendas'
              ? 'bg-primary text-on-primary shadow'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          Tiendas (CO)
        </button>
      </div>

      <div className="flex-1 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden p-6">
        {activeTab === 'regionales' && <RegionalesPage />}
        {activeTab === 'ciudades' && <CiudadesPage />}
        {activeTab === 'tiendas' && <CentrosOperacionPage />}
      </div>
    </div>
  );
};
