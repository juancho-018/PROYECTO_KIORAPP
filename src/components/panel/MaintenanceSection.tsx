import { useState, useEffect } from 'react';
import { maintenanceService, alertService, productService } from '@/config/setup';
import type { MaintenanceReport } from '@/models/Maintenance';
import { ExportDrawer } from './ExportDrawer';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function MaintenanceSection() {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [filter, setFilter] = useState({ estado: '', prioridad: '' });

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const resp = await maintenanceService.fetchReports(1, 100);
      setReports(resp.data);
    } catch (error) {
      alertService.showToast('error', getErrorMessage(error, 'Error al cargar los reportes'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await maintenanceService.updateReport(id, { estado: newStatus as any });
      alertService.showToast('success', 'Estado actualizado');
      void loadReports();
    } catch (error) {
       alertService.showToast('error', 'No se pudo actualizar el estado');
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter.estado && r.estado !== filter.estado) return false;
    if (filter.prioridad && r.prioridad !== filter.prioridad) return false;
    return true;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'alta': return 'bg-red-50 text-red-600 border-red-100';
      case 'media': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'en_proceso': return 'En Revisión';
      case 'resuelto': return 'Resuelto';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Soporte Técnico</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Control de Fallos</h2>
          <p className="text-sm text-slate-500 font-medium">Gestiona incidencias, llama al técnico y exporta reportes de cumplimiento.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </button>
          <button 
            className="inline-flex items-center gap-2 rounded-2xl bg-[#ec131e] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] active:scale-95"
            onClick={() => alertService.showToast('info', 'Llamando al técnico... Notificación enviada.')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Llamar al Técnico
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado:</span>
            <div className="flex gap-2">
              {['', 'pendiente', 'en_proceso', 'resuelto'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(f => ({ ...f, estado: s }))}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter.estado === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {s || 'Todos'}
                </button>
              ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-4xl bg-slate-100"></div>
          ))
        ) : filteredReports.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-400 font-bold">No se encontraron reportes con estos filtros.</p>
          </div>
        ) : (
          filteredReports.map((r) => (
            <article key={r.id_rep} className="group relative overflow-hidden flex flex-col p-8 rounded-4xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border ${getPriorityColor(r.prioridad)}`}>
                  Prioridad {r.prioridad}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  #{r.id_rep} • {new Date(r.fecha_rep).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-3 leading-tight">{r.descripcion}</h3>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${r.estado === 'resuelto' ? 'bg-emerald-500' : r.estado === 'en_proceso' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                   <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{getStatusLabel(r.estado)}</span>
                </div>

                <div className="flex items-center gap-1">
                  {r.estado !== 'resuelto' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id_rep, r.estado === 'pendiente' ? 'en_proceso' : 'resuelto')}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                      {r.estado === 'pendiente' ? 'Atender' : 'Resolver'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <ExportDrawer 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
    </div>
  );
}
