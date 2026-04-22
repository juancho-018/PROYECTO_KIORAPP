import { useState, useEffect, useCallback } from 'react';
import { authService, alertService, incidentService } from '@/config/setup';
import type { Incident, CreateIncidentDto } from '@/models/Incident';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function MaintenanceSection() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newIncident, setNewIncident] = useState<Partial<CreateIncidentDto>>({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    categoria: 'tecnico'
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const user = authService.getUser();
  const isAdmin = authService.isAdmin();

  const loadIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await incidentService.getIncidents();
      setIncidents(data);
    } catch (e) {
      // Si el servicio falla (ej. no implementado en backend), mostramos vacío
      console.warn('Error loading incidents:', e);
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadIncidents(); }, [loadIncidents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id_usu) return alertService.showToast('error', 'Sesión inválida');
    
    setIsSaving(true);
    try {
      await incidentService.createIncident({
        ...newIncident as CreateIncidentDto,
        fk_id_usu: user.id_usu
      });
      alertService.showToast('success', 'Reporte enviado correctamente');
      setShowForm(false);
      setNewIncident({ titulo: '', descripcion: '', prioridad: 'media', categoria: 'tecnico' });
      loadIncidents();
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al enviar reporte'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (id: number, status: Incident['estado']) => {
    try {
      await incidentService.updateIncidentStatus(id, status);
      alertService.showToast('success', 'Estado actualizado');
      loadIncidents();
    } catch (e) {
      alertService.showToast('error', 'No se pudo actualizar el estado');
    }
  };

  const priorityColor = (p: string) => {
    switch(p) {
      case 'alta': return 'text-red-600 bg-red-50 ring-red-100';
      case 'media': return 'text-amber-600 bg-amber-50 ring-amber-100';
      case 'baja': return 'text-emerald-600 bg-emerald-50 ring-emerald-100';
      default: return 'text-slate-600 bg-slate-50 ring-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/5 border border-slate-900/10">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900/60">Infraestructura</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">Mantenimiento <span className="text-[#ec131e]">&</span> Soporte</h2>
          <p className="text-sm text-slate-500 font-medium">Gestión de tickets y reporte de fallos técnicos.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="rounded-2xl bg-[#ec131e] px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] active:scale-95 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Reportar Fallo
          </button>
        )}
      </header>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-slate-100/50 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-800">Nuevo Reporte de Incidencia</h3>
             <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest">Cancelar</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título del Fallo</label>
              <input 
                required
                type="text" 
                value={newIncident.titulo}
                onChange={e => setNewIncident({...newIncident, titulo: e.target.value})}
                placeholder="Ej: Impresora no funciona..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 px-5 text-sm font-bold focus:border-[#ec131e] focus:bg-white focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría</label>
              <select 
                value={newIncident.categoria}
                onChange={e => setNewIncident({...newIncident, categoria: e.target.value as any})}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 px-5 text-sm font-bold focus:border-[#ec131e] focus:bg-white focus:outline-none transition-all"
              >
                <option value="tecnico">Técnico / Hardware</option>
                <option value="software">Software / App</option>
                <option value="limpieza">Limpieza / Local</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción Detallada</label>
              <textarea 
                required
                rows={4}
                value={newIncident.descripcion}
                onChange={e => setNewIncident({...newIncident, descripcion: e.target.value})}
                placeholder="Explica qué sucedió y cuándo..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-4 px-5 text-sm font-bold focus:border-[#ec131e] focus:bg-white focus:outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Prioridad</label>
              <div className="flex gap-2">
                {['baja', 'media', 'alta'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewIncident({...newIncident, prioridad: p as any})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${newIncident.prioridad === p ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full rounded-2xl bg-slate-900 text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {isSaving ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Historial de Incidencias</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{incidents.length} Registros</span>
        </div>
        
        {isLoading ? (
          <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-[#ec131e] rounded-full animate-spin"></div></div>
        ) : incidents.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-sm font-bold text-slate-400 italic">No hay incidencias reportadas actualmente.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {incidents.map(incident => (
              <div key={incident.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ring-1 ${priorityColor(incident.prioridad)}`}>
                      {incident.prioridad}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {incident.categoria} • {new Date(incident.creado_en!).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">{incident.titulo}</h4>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2">{incident.descripcion}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                     <p className={`text-xs font-black uppercase ${incident.estado === 'abierto' ? 'text-amber-500' : incident.estado === 'en_progreso' ? 'text-blue-500' : 'text-emerald-500'}`}>
                        {incident.estado.replace('_', ' ')}
                     </p>
                  </div>
                  
                  {isAdmin && incident.estado !== 'cerrado' && (
                    <div className="flex gap-2">
                      {incident.estado === 'abierto' && (
                        <button 
                          onClick={() => updateStatus(incident.id!, 'en_progreso')}
                          className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm"
                        >
                          Atender
                        </button>
                      )}
                      <button 
                        onClick={() => updateStatus(incident.id!, 'cerrado')}
                        className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
