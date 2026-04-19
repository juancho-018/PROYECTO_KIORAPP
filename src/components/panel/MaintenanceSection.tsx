import { useState, useEffect, useCallback } from 'react';
import { maintenanceService, alertService, authService } from '@/config/setup';
import type { MaintenanceReport } from '@/models/Maintenance';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function MaintenanceSection() {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = authService.getUser();
  const isAdmin = user?.rol_usu?.toLowerCase() === 'administrador';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getReports();
      setReports(data);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar mantenimientos'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleExportExcel = async () => {
    try {
      await maintenanceService.exportExcel();
      alertService.showToast('success', 'Excel exportado correctamente');
    } catch (e) {
      alertService.showToast('error', 'Error al exportar Excel');
    }
  };

  const handleExportPdf = async () => {
    try {
      await maintenanceService.exportPdf();
      alertService.showToast('success', 'PDF exportado correctamente');
    } catch (e) {
      alertService.showToast('error', 'Error al exportar PDF');
    }
  };

  return (
    <div className="space-y-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Soporte Técnico</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">Mantenimiento</h1>
          <p className="text-sm text-slate-500 font-medium">Gestión de incidencias y reportes técnicos.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 active:scale-95 transition-all"
            >
              PDF
            </button>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ec131e]" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Título / Ref</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                  {isAdmin && (
                    <>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Prioridad</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fecha</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Técnico</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 3} className="py-10 text-center text-slate-400 text-sm">No hay incidencias registradas</td></tr>
                ) : (
                  reports.map(r => (
                    <tr key={r.id_rep} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-400 text-xs">#{r.id_rep}</td>
                      <td className="px-5 py-3 font-semibold text-[#111827]">{r.observaciones_tecnicas || 'Sin título'}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          r.estado === 'completado' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          r.estado === 'pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {r.estado}
                        </span>
                      </td>
                      {isAdmin && (
                        <>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                              r.prioridad === 'alta' ? 'bg-red-50 text-red-600' : r.prioridad === 'media' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {r.prioridad}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500 text-xs">
                            {r.fecha_rep ? new Date(r.fecha_rep).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-5 py-3 text-slate-500 font-medium">
                            {r.tecnico?.nom_usu ?? '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
          <p className="text-xs text-slate-400 font-medium italic text-center">
            * Como operario, solo tienes permiso para visualizar el título y estado de las incidencias.
          </p>
        </div>
      )}
    </div>
  );
}
