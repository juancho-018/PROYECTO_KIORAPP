import React, { useEffect, useState } from 'react';
import { healthService } from '../../config/setup';
import type { GatewayHealthResponse } from '../../services/HealthService';

export const HealthCheckPanel: React.FC = () => {
  const [health, setHealth] = useState<GatewayHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await healthService.getAllHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al obtener estado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Actualizar cada 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Estado del Sistema</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitoreo en tiempo real de microservicios</p>
        </div>
        <button 
          onClick={fetchHealth}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          {loading ? 'Sincronizando...' : 'Refrescar'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <p className="font-bold">Error de conexión</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* API Gateway Card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${health?.gateway === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {health?.gateway === 'up' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white">API Gateway</h3>
          <p className="text-sm text-gray-500 mb-4 truncate">Punto de entrada centralizado</p>
          <div className="text-xs text-gray-400 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-500"></span>
             Puerto: 3000
          </div>
        </div>

        {/* Microservices Cards */}
        {health && Object.entries(health.services).map(([name, status]) => (
          <div key={name} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm italic-card">
            <div className="flex justify-between items-start mb-4">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg capitalize">
                 {name.charAt(0)}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.status === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status.status.toUpperCase()}
              </span>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white capitalize">{name} Service</h3>
            <p className="text-sm text-gray-500 mb-4">Microservicio de {name}</p>
            {status.error ? (
              <div className="text-xs text-red-500 truncate">{status.error}</div>
            ) : (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${status.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                Estado: {status.statusCode || 200} OK
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-sm text-amber-800 dark:text-amber-400">
        <p><strong>Nota:</strong> Si un servicio aparece como DOWN, verifica los logs en Docker o la conectividad de la base de datos asociada.</p>
      </div>
    </div>
  );
};
