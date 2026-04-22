import { useState, useEffect, useCallback } from 'react';
import { authService, alertService } from '@/config/setup';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function MaintenanceSection() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAdmin = authService.isAdmin();

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulado por ahora o llamar a servicio si existe
      setReports([]);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar reportes'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadReports(); }, [loadReports]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mantenimiento & Reportes</h2>
          <p className="text-sm text-slate-500 font-medium">Gestión de infraestructura y fallos técnicos.</p>
        </div>
      </header>

      <div className="bg-white border rounded-3xl p-20 text-center space-y-6 shadow-sm">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-bold text-slate-900">Panel en Construcción</h3>
          <p className="text-sm text-slate-500 mt-2">Estamos integrando el sistema de tickets con el backend de infraestructura. Pronto podrás reportar fallos directamente aquí.</p>
        </div>
        <div className="flex justify-center gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Reintentar Conexión</button>
        </div>
      </div>
    </div>
  );
}
