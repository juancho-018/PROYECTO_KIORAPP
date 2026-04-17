import { useState, useEffect, useCallback } from 'react';
import { maintenanceService, alertService } from '@/config/setup';
import type { MaintenanceReport } from '@/models/Maintenance';
import { getErrorMessage } from '@/utils/getErrorMessage';

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  en_progreso: 'bg-blue-100 text-blue-700',
  completado: 'bg-emerald-100 text-emerald-700',
};

const EMPTY_FORM: Omit<MaintenanceReport, 'id' | 'fecha_creacion' | 'fecha_actualizacion'> = {
  titulo: '',
  descripcion: '',
  estado: 'pendiente',
  responsable: '',
};

export function MaintenanceSection() {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceReport | null>(null);
  const [form, setForm] = useState<Omit<MaintenanceReport, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getReports();
      setReports(data);
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cargar reportes'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleSave() {
    if (!form.titulo?.trim()) { alertService.showToast('warning', 'El título es obligatorio'); return; }
    setSaving(true);
    try {
      if (editing?.id) {
        await maintenanceService.updateReport(editing.id, form);
        alertService.showToast('success', 'Reporte actualizado');
      } else {
        await maintenanceService.createReport(form);
        alertService.showToast('success', 'Reporte creado');
      }
      setDrawerOpen(false);
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al guardar'));
    } finally {
      setSaving(false);
    }
  }

  async function handleExport(type: 'excel' | 'pdf') {
    setExporting(true);
    try {
      if (type === 'excel') await maintenanceService.exportExcel();
      else await maintenanceService.exportPdf();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al exportar'));
    } finally {
      setExporting(false);
    }
  }

  async function quickStatus(report: MaintenanceReport, estado: MaintenanceReport['estado']) {
    if (!report.id) return;
    try {
      await maintenanceService.updateReport(report.id, { estado });
      alertService.showToast('success', 'Estado actualizado');
      void load();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error'));
    }
  }

  const stats = {
    total: Array.isArray(reports) ? reports.length : 0,
    pendiente: Array.isArray(reports) ? reports.filter(r => r.estado === 'pendiente').length : 0,
    en_progreso: Array.isArray(reports) ? reports.filter(r => r.estado === 'en_progreso').length : 0,
    completado: Array.isArray(reports) ? reports.filter(r => r.estado === 'completado').length : 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Operaciones</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">Mantenimiento</h1>
          <p className="text-sm text-slate-500 font-medium">Gestión de reportes y órdenes de mantenimiento.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => void handleExport('excel')}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
          </button>
          <button
            onClick={() => void handleExport('pdf')}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            PDF
          </button>
          <button
            onClick={() => { setEditing(null); setForm(EMPTY_FORM); setDrawerOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 hover:bg-[#d01019] active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Nuevo Reporte
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Pendiente', value: stats.pendiente, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'En progreso', value: stats.en_progreso, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completado', value: stats.completado, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl ${s.bg} border border-white/60 px-5 py-4`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reports */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#ec131e]" />
        </div>
      ) : (!Array.isArray(reports) || reports.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <svg className="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="font-semibold text-lg">Sin reportes</p>
          <p className="text-sm">Crea el primer reporte de mantenimiento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.isArray(reports) && reports.map(r => (
            <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#111827] truncate">{r.titulo ?? 'Sin título'}</h3>
                  {r.responsable && <p className="text-xs text-slate-400 mt-0.5">Responsable: {r.responsable}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_COLORS[r.estado ?? 'pendiente']}`}>
                  {r.estado === 'en_progreso' ? 'En progreso' : r.estado === 'completado' ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              {r.descripcion && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{r.descripcion}</p>}
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {(['pendiente', 'en_progreso', 'completado'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => void quickStatus(r, s)}
                      disabled={r.estado === s}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${r.estado === s ? ESTADO_COLORS[s] + ' cursor-default' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {s === 'en_progreso' ? 'Progreso' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setEditing(r);
                    setForm({ titulo: r.titulo ?? '', descripcion: r.descripcion ?? '', estado: r.estado ?? 'pendiente', responsable: r.responsable ?? '' });
                    setDrawerOpen(true);
                  }}
                  className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100"
                >Editar</button>
              </div>
              {r.fecha_creacion && (
                <p className="text-[10px] text-slate-300 mt-3">{new Date(r.fecha_creacion).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-extrabold">{editing ? 'Editar Reporte' : 'Nuevo Reporte'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Título *</label>
                <input
                  type="text"
                  value={form.titulo ?? ''}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea
                  rows={4}
                  value={form.descripcion ?? ''}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Responsable</label>
                <input
                  type="text"
                  value={form.responsable ?? ''}
                  onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado</label>
                <select
                  value={form.estado ?? 'pendiente'}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value as MaintenanceReport['estado'] }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600">Cancelar</button>
              <button onClick={() => void handleSave()} disabled={saving} className="flex-1 rounded-xl bg-[#ec131e] py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {saving ? 'Guardando…' : (editing ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
