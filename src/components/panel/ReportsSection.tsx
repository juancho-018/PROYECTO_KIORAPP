import React, { useState, useEffect } from 'react';
import { reportService, productService, alertService } from '@/config/setup';
import type { ReportFilters, DetailedSalesReport, ProductRankingReport } from '@/services/ReportService';
import type { Category } from '@/models/Product';

export function ReportsSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    grouping: 'dia',
    reportType: 'ventas_detalladas',
    topN: 10,
    category: undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kiora_saved_reports');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<'generar' | 'guardados'>('generar');

  useEffect(() => {
    localStorage.setItem('kiora_saved_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveReport = () => {
    if (reportData.length === 0) return;
    const newReport = {
      id: Date.now(),
      filters: { ...filters },
      date: new Date().toLocaleString(),
      name: `Reporte ${filters.reportType === 'ventas_detalladas' ? 'Ventas' : 'Ranking'} (${filters.startDate} a ${filters.endDate})`
    };
    setSavedReports([newReport, ...savedReports]);
    alertService.showSuccess('Guardado', 'El reporte ha sido marcado para consulta posterior');
  };

  const deleteSavedReport = (id: number) => {
    setSavedReports(savedReports.filter(r => r.id !== id));
  };

  const loadSavedReport = (report: any) => {
    setFilters(report.filters);
    setActiveTab('generar');
    // We could auto-generate here, but better to let the user click
  };

  const loadCategories = async () => {
// ... (loadCategories logic)
    try {
      const res = await productService.getCategories();
      setCategories(res.data || []);
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    setReportData([]);
    try {
      if (filters.reportType === 'ventas_detalladas') {
        const data = await reportService.getDetailedSales(filters);
        setReportData(data);
      } else {
        const data = await reportService.getProductRanking(filters);
        setReportData(data);
      }
    } catch (error: any) {
      alertService.showError('Error', error.message || 'No se pudo generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) return;
    const fileName = `kiora_reporte_${filters.reportType}_${new Date().toISOString().slice(0, 10)}`;
    reportService.exportToExcel(reportData, fileName);
    alertService.showSuccess('Éxito', 'Reporte exportado a Excel');
  };

  const handleExportPdf = () => {
    if (reportData.length === 0) return;
    const fileName = `kiora_reporte_${filters.reportType}_${new Date().toISOString().slice(0, 10)}`;
    
    let title = '';
    let head: string[][] = [];
    let body: any[][] = [];

    if (filters.reportType === 'ventas_detalladas') {
      title = 'Reporte de Ventas Detalladas';
      head = [['Periodo', 'Total Ventas', 'Cant. Pedidos', 'Ticket Promedio']];
      body = (reportData as DetailedSalesReport[]).map(d => [
        d.period,
        `$${Number(d.totalSales).toLocaleString('es-CO')}`,
        d.orderCount,
        `$${Number(d.averageTicket).toLocaleString('es-CO')}`
      ]);
    } else {
      title = filters.reportType === 'mas_vendidos' ? 'Ranking: Productos Más Vendidos' : 'Ranking: Productos Menos Vendidos';
      head = [['Pos.', 'Producto', 'Código', 'Cantidad', 'Ingresos Totales']];
      body = (reportData as ProductRankingReport[]).map(d => [
        d.position,
        d.productName,
        d.productCode,
        d.quantitySold,
        `$${Number(d.totalRevenue).toLocaleString('es-CO')}`
      ]);
    }

    reportService.exportToPdf(title, head, body, fileName);
    alertService.showSuccess('Éxito', 'Reporte exportado a PDF');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Reportes de <span className="text-[#ec131e]">Inteligencia</span>
          </h1>
          <p className="mt-2 text-slate-500 font-medium italic">Análisis estratégico y auditoría de rendimiento comercial.</p>
        </div>
        
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('generar')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'generar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Generar
          </button>
          <button 
            onClick={() => setActiveTab('guardados')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'guardados' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Guardados ({savedReports.length})
          </button>
        </div>
      </header>

      {activeTab === 'generar' ? (
        <>
          {/* Filter Panel */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Range */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Rango de Fechas</label>
            <div className="flex items-center gap-3">
              <input 
                type="date" 
                value={filters.startDate}
                onChange={e => setFilters({...filters, startDate: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-100 transition-all"
              />
              <span className="text-slate-300 font-bold">→</span>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={e => setFilters({...filters, endDate: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>
          </div>

          {/* Grouping / Type */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Reporte y Agrupación</label>
            <div className="flex gap-3">
              <select 
                value={filters.reportType}
                onChange={e => setFilters({...filters, reportType: e.target.value as any})}
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer"
              >
                <option value="ventas_detalladas">Ventas Detalladas</option>
                <option value="mas_vendidos">Más Vendidos</option>
                <option value="menos_vendidos">Menos Vendidos</option>
              </select>
              {filters.reportType === 'ventas_detalladas' && (
                <select 
                  value={filters.grouping}
                  onChange={e => setFilters({...filters, grouping: e.target.value as any})}
                  className="w-32 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="dia">Día</option>
                  <option value="semana">Semana</option>
                  <option value="mes">Mes</option>
                </select>
              )}
            </div>
          </div>

          {/* Additional Params */}
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Parámetros Adicionales</label>
            <div className="flex gap-3">
              {(filters.reportType === 'mas_vendidos' || filters.reportType === 'menos_vendidos') && (
                <div className="flex-1 flex items-center bg-slate-50 rounded-xl px-4 py-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase mr-2">TOP</span>
                  <input 
                    type="number" 
                    value={filters.topN}
                    onChange={e => setFilters({...filters, topN: Number(e.target.value)})}
                    className="w-full bg-transparent border-none p-0 text-sm font-black text-[#ec131e] focus:ring-0"
                  />
                </div>
              )}
              <select 
                value={filters.category || ''}
                onChange={e => setFilters({...filters, category: e.target.value ? Number(e.target.value) : undefined})}
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer"
              >
                <option value="">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.cod_cat} value={c.cod_cat}>{c.nom_cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-4 border-t border-slate-50 pt-8">
          <button 
            onClick={generateReport}
            disabled={isLoading}
            className="bg-[#ec131e] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-[#d01019] hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )}
            Generar Reporte
          </button>
        </div>
      </section>

      {/* Results Section */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Previsualización de Datos</h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Resultado del análisis seleccionado</p>
          </div>
          {reportData.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleSaveReport} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm border border-blue-100/50" title="Marcar/Guardar Reporte">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </button>
              <button onClick={handleExportExcel} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-100/50" title="Exportar Excel">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
              <button onClick={handleExportPdf} className="p-3 bg-red-50 text-[#ec131e] rounded-xl hover:bg-red-100 transition-colors shadow-sm border border-red-100/50" title="Exportar PDF">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </button>
            </div>
          )}
        </div>

        {reportData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 bg-white border-b border-slate-50">
            {filters.reportType === 'ventas_detalladas' ? (
              <>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos Totales</p>
                  <p className="text-2xl font-black text-slate-900">$ {reportData.reduce((acc, curr) => acc + curr.totalSales, 0).toLocaleString('es-CO')}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pedidos</p>
                  <p className="text-2xl font-black text-slate-900">{reportData.reduce((acc, curr) => acc + curr.orderCount, 0)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Promedio</p>
                  <p className="text-2xl font-black text-[#ec131e]">$ {(reportData.reduce((acc, curr) => acc + curr.totalSales, 0) / reportData.reduce((acc, curr) => acc + (curr.orderCount || 1), 0)).toLocaleString('es-CO')}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Periodos</p>
                  <p className="text-2xl font-black text-slate-900">{reportData.length}</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidades Vendidas</p>
                  <p className="text-2xl font-black text-slate-900">{reportData.reduce((acc, curr) => acc + curr.quantitySold, 0)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facturación Top</p>
                  <p className="text-2xl font-black text-slate-900">$ {reportData.reduce((acc, curr) => acc + curr.totalRevenue, 0).toLocaleString('es-CO')}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 col-span-1 sm:col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{filters.reportType === 'mas_vendidos' ? 'Producto Estrella' : 'Producto Crítico'}</p>
                  <p className="text-xl font-black text-[#ec131e] truncate">{reportData[0]?.productName || '—'}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          {reportData.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                {filters.reportType === 'ventas_detalladas' ? (
                  <tr>
                    <th className="px-8 py-5">Periodo</th>
                    <th className="px-8 py-5">Total Ventas</th>
                    <th className="px-8 py-5">Cant. Pedidos</th>
                    <th className="px-8 py-5">Ticket Promedio</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-8 py-5">Pos.</th>
                    <th className="px-8 py-5">Producto</th>
                    <th className="px-8 py-5">Código</th>
                    <th className="px-8 py-5">Cant. Vendida</th>
                    <th className="px-8 py-5 text-right">Monto Total</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filters.reportType === 'ventas_detalladas' ? (
                  (reportData as DetailedSalesReport[]).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-black text-slate-900 uppercase">{row.period}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">$ {row.totalSales.toLocaleString('es-CO')}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">{row.orderCount}</td>
                      <td className="px-8 py-5 text-sm font-black text-[#ec131e]">$ {row.averageTicket.toLocaleString('es-CO')}</td>
                    </tr>
                  ))
                ) : (
                  (reportData as ProductRankingReport[]).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${idx < 3 ? 'bg-red-50 text-[#ec131e]' : 'bg-slate-100 text-slate-400'}`}>
                          {row.position}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-900">{row.productName}</td>
                      <td className="px-8 py-5 text-xs font-mono font-bold text-slate-400">#{row.productCode}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-600">{row.quantitySold} uds</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900 text-right">$ {row.totalRevenue.toLocaleString('es-CO')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="py-32 flex flex-col items-center text-center px-8">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h4 className="text-slate-400 font-black uppercase tracking-widest text-xs">Sin Datos Generados</h4>
              <p className="text-slate-300 text-sm font-medium mt-2 max-w-xs">Selecciona los filtros y haz clic en "Generar Reporte" para visualizar los resultados.</p>
            </div>
          )}
        </div>
      </section>
        </>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
          {savedReports.map((report: any) => (
            <div key={report.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-[#ec131e]/5 group-hover:text-[#ec131e] transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <button onClick={() => deleteSavedReport(report.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-1">{report.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Guardado el {report.date}</p>
              
              <button 
                onClick={() => loadSavedReport(report)}
                className="w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                Cargar Parámetros
              </button>
            </div>
          ))}
          {savedReports.length === 0 && (
            <div className="col-span-full py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center text-center px-8 w-full">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </div>
              <h4 className="text-slate-400 font-black uppercase tracking-widest text-xs">Sin Reportes Marcados</h4>
              <p className="text-slate-300 text-sm font-medium mt-2 max-w-xs">Genera un reporte y haz clic en el icono de marcador para guardarlo aquí.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
