import React, { useState } from 'react';
import { orderService, alertService } from '@/config/setup';

interface SalesExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesExportDrawer: React.FC<SalesExportDrawerProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === 'excel') {
        alertService.showToast('warning', 'Exportación a Excel no implementada');
      } else {
        await orderService.exportPdf();
      }
      
      alertService.showToast('success', 'Preparando reporte detallado...');
      onClose();
    } catch (error) {
      alertService.showToast('error', 'Error al exportar ventas');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm rounded-4xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Exportar Ventas</h3>
        <p className="text-sm font-medium text-slate-500 mb-8">Incluye el desglose de ítems, precios y totales de todas las órdenes.</p>
        
        <div className="space-y-3 mb-8">
          <button
            onClick={() => setFormat('pdf')}
            className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all ${
              format === 'pdf' ? 'border-[#ec131e] bg-red-50/50' : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${format === 'pdf' ? 'bg-[#ec131e] text-white' : 'bg-slate-100 text-slate-400'}`}>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                 </svg>
              </div>
              <span className={`font-bold ${format === 'pdf' ? 'text-slate-900' : 'text-slate-400'}`}>Formato PDF</span>
            </div>
          </button>

          <button
            onClick={() => setFormat('excel')}
            className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all ${
              format === 'excel' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${format === 'excel' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
              </div>
              <span className={`font-bold ${format === 'excel' ? 'text-slate-900' : 'text-slate-400'}`}>Microsoft Excel</span>
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`flex-1 rounded-2xl py-4 text-sm font-black text-white shadow-xl transition-all ${
              format === 'excel' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-[#ec131e] shadow-[#ec131e]/20'
            }`}
          >
            {isExporting ? 'Generando...' : 'Descargar'}
          </button>
        </div>
      </div>
    </div>
  );
};
