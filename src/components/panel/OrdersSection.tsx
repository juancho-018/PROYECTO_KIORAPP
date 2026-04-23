import React, { useState, useEffect } from 'react';
import { orderService, alertService } from '@/config/setup';
import type { Order, Invoice } from '@/models/Order';
import { OrderDetailDrawer } from './OrderDetailDrawer';

// @ts-ignore
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'ventas' | 'facturas'>('ventas');
  const [searchInvoiceId, setSearchInvoiceId] = useState('');

  // Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeSubTab === 'ventas') {
        const res = await orderService.getOrders();
        if (res) setOrders(Array.isArray(res) ? res : (res.data || []));
      } else {
        const res = await orderService.getInvoices();
        if (res && res.data) setInvoices(res.data);
      }
    } catch (error: any) {
      alertService.showError('Error', error.message || 'Error cargando datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (order: Order) => {
    try {
      const detailed = await orderService.getOrderById(order.id_vent!);
      setSelectedOrder(detailed);
      setIsDetailOpen(true);
    } catch (error: any) {
      alertService.showError('Error', 'No se pudo cargar el detalle de la venta');
    }
  };

  const downloadInvoicePDF = (invoice: Invoice) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(236, 19, 30); // Kiora Red
    doc.text('KIORA - FACTURA DE VENTA', 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`ID Factura: FAC-${invoice.id_fact}`, 20, 40);
    doc.text(`ID Pedido: #${invoice.id_pedido}`, 20, 45);
    doc.text(`Fecha Emisión: ${new Date(invoice.fecha_fact).toLocaleString()}`, 20, 50);
    
    // Customer Info (Placeholder)
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Detalles del Cliente:', 20, 65);
    doc.setFontSize(10);
    doc.text(`Identificador: ${invoice.id_usu || 'Cliente General'}`, 20, 72);
    
    // Table
    const tableData = [
      ['Descripción', 'Cantidad', 'Precio Unit.', 'Total'],
      ['Servicio/Producto Kiora', invoice.cantidad_vent, `$${Number(invoice.precio_prod).toLocaleString()}`, `$${Number(invoice.total_fact).toLocaleString()}`]
    ];
    
    doc.autoTable({
      startY: 85,
      head: [tableData[0]],
      body: [tableData[1]],
      theme: 'striped',
      headStyles: { fillColor: [236, 19, 30] }
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`TOTAL A PAGAR: $${Number(invoice.total_fact).toLocaleString()}`, 140, finalY);
    
    // Footer
    doc.setFontSize(8);
    doc.text('Gracias por su compra en Kiora. Este documento es un soporte legal de su transacción.', 20, 280);
    
    doc.save(`Factura_Kiora_FAC-${invoice.id_fact}.pdf`);
    alertService.showToast('success', 'PDF generado correctamente');
  };

  const handleDeleteOrder = async (id: number) => {
    const confirmed = await alertService.showConfirm(
      '¿Eliminar Venta?',
      'Esta acción eliminará el pedido y sus registros asociados permanentemente.',
      'Sí, eliminar',
      'Cancelar'
    );
    if (!confirmed) return;

    try {
      await orderService.deleteOrder(id);
      alertService.showSuccess('Eliminado', 'Venta eliminada del sistema');
      loadData();
    } catch (error: any) {
      alertService.showError('Error', error.message || 'No se pudo eliminar el registro');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const currentOrder = orders.find(o => o.id_vent === id);
    if (currentOrder?.estado === 'cancelada') {
      alertService.showToast('warning', 'No se puede modificar una venta ya cancelada');
      return;
    }

    if (status === 'cancelada') {
      const confirmed = await alertService.showConfirm(
        '¿Cancelar Pedido?',
        'Esta acción no se puede deshacer y la venta quedará bloqueada permanentemente.',
        'Sí, cancelar',
        'Volver'
      );
      if (!confirmed) {
        loadData(); // Recargar para revertir el select al estado anterior
        return;
      }
    }

    try {
      await orderService.updateOrderStatus(id, status as any);
      alertService.showToast('success', `Estado actualizado a ${status}`);
      loadData();
    } catch (error: any) {
      alertService.showError('Error', 'No se pudo actualizar el estado');
      loadData();
    }
  };

  return (
    <>
      <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">
              Caja <span className="text-[#ec131e]">& Ventas</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Historial de pedidos y facturación financiera.</p>
          </div>
          
          {activeSubTab === 'facturas' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  placeholder="Buscar Factura #ID..." 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm focus:ring-[#ec131e] focus:border-[#ec131e]"
                  value={searchInvoiceId}
                  onChange={(e) => setSearchInvoiceId(e.target.value.replace(/\D/g, ''))}
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <button 
                onClick={() => void orderService.exportInvoicesExcel()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ecfdf3] px-5 py-2.5 text-sm font-bold text-[#10b981] border border-[#d1fae5] hover:bg-[#d1fae5] transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Exportar Excel
              </button>
            </div>
          )}
        </div>

        {/* Subtabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          <button 
            onClick={() => setActiveSubTab('ventas')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'ventas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pedidos (Live)
          </button>
          <button 
            onClick={() => setActiveSubTab('facturas')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeSubTab === 'facturas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Facturación Histórica
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        {isLoading ? (
          <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-red-100 border-t-[#ec131e] rounded-full animate-spin"></div></div>
        ) : activeSubTab === 'ventas' ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ID / Fecha</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map(order => (
                <tr key={order.id_vent} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-gray-900">#{order.id_vent}</p>
                    <p className="text-[10px] text-gray-400">{order.fecha_vent ? new Date(order.fecha_vent).toLocaleDateString() : '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">ID Usuario: {order.metodopago_usu || 'Cliente'}</td>
                  <td className="px-6 py-4 text-center">
                    <select 
                      value={order.estado}
                      disabled={order.estado === 'cancelada'}
                      onChange={(e) => handleUpdateStatus(order.id_vent!, e.target.value)}
                      className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-none ring-1 appearance-none cursor-pointer text-center disabled:opacity-70 disabled:cursor-not-allowed ${
                        order.estado === 'completada' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 
                        order.estado === 'cancelada' ? 'bg-red-50 text-red-600 ring-red-100' : 
                        'bg-amber-50 text-amber-600 ring-amber-100'
                      }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 font-black">
                    ${Number(order.montofinal_vent).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleOpenDetail(order)} className="w-8 h-8 rounded-lg bg-red-50 text-[#ec131e] flex items-center justify-center hover:bg-red-100" title="Ver Detalle"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                       <button onClick={() => handleDeleteOrder(order.id_vent!)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100" title="Eliminar"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-slate-400">No hay pedidos registrados hoy.</td></tr>}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ID / Factura</th>
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Fecha Emisión</th>
                <th className="px-6 py-4 text-right">Total Facturado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.filter(i => searchInvoiceId ? String(i.id_fact).includes(searchInvoiceId) : true).map(invoice => (
                <tr key={invoice.id_fact} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-gray-900 text-sm">FAC-{invoice.id_fact}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">#{invoice.id_pedido}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(invoice.fecha_fact).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-[#ec131e] font-black">${Number(invoice.total_fact).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                     <button 
                        onClick={() => downloadInvoicePDF(invoice)}
                        className="text-[10px] font-black uppercase text-gray-400 hover:text-[#ec131e] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-1 float-right"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Descargar PDF
                      </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={5} className="py-20 text-center text-slate-400">No hay facturas registradas.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <OrderDetailDrawer 
        isOpen={isDetailOpen}
        order={selectedOrder}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
