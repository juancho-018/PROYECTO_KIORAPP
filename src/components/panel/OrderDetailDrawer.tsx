import React from 'react';
import type { Order } from '@/models/Order';

interface OrderDetailDrawerProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  isOpen,
  order,
  onClose
}) => {
  if (!order) return null;

  return (
    <div className={`fixed inset-0 z-[99999] transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-120 max-w-[calc(100vw-1rem)] bg-[#fafafc] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <h2 className="text-[15px] font-black text-gray-900">Detalle de Venta #{order.id_vent}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.fecha_vent).toLocaleString()}</p>
          </div>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</p>
                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  order.estado === 'completada' ? 'bg-emerald-50 text-emerald-600' : 
                  order.estado === 'cancelada' ? 'bg-red-50 text-red-600' : 
                  'bg-amber-50 text-amber-600'
                }`}>
                  {order.estado}
                </div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Método de Pago</p>
                <p className="text-sm font-black text-gray-900 capitalize">{order.metodopago_usu || 'Efectivo'}</p>
             </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Productos Comprados</h3>
             <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">ID Prod #{item.cod_prod}</p>
                        <p className="text-xs text-gray-500 font-medium">{item.cantidad} unidad(es) x ${Number(item.precio_unit).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-[#ec131e]">${(item.cantidad * item.precio_unit).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm font-medium">No hay items registrados para esta venta.</div>
                )}
             </div>
          </div>

          {/* Summary */}
          <div className="mt-auto space-y-3 bg-red-50/50 p-6 rounded-3xl border border-red-100/50">
             <div className="flex justify-between items-center text-gray-500 text-sm font-bold">
                <span>Subtotal</span>
                <span>${Number(order.precio_prod_final || 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-gray-500 text-sm font-bold">
                <span>Impuestos / Descuentos</span>
                <span>$0</span>
             </div>
             <div className="flex justify-between items-center pt-3 border-t border-red-100">
                <span className="text-gray-900 font-black">Total Final</span>
                <span className="text-2xl font-black text-[#ec131e]">${Number(order.montofinal_vent).toLocaleString()}</span>
             </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-3">
          <button 
             onClick={() => window.print()}
             className="w-full bg-gray-900 hover:bg-[#111] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4" /></svg>
            <span>Imprimir Ticket</span>
          </button>
          <button 
             onClick={onClose} 
             className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-gray-100 transition-all"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
