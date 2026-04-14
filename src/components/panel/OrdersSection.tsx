import { useState, useEffect } from 'react';
import { orderService, alertService } from '@/config/setup';
import type { Order, CreateOrderDto } from '@/models/Order';
import { OrderDrawer } from './OrderDrawer';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { SalesExportDrawer } from './SalesExportDrawer';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useStockSync } from '@/context/StockContext';

export function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notifyStockChange } = useStockSync();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.fetchOrders(50, 0);
      setOrders(data);
    } catch (error) {
      alertService.showToast('error', 'Error al cargar órdenes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada': return 'bg-emerald-50 text-emerald-600';
      case 'cancelada': return 'bg-red-50 text-red-600';
      case 'pendiente': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const handleUpdateStatus = async (id: number, status: 'completada' | 'cancelada') => {
    const action = status === 'completada' ? 'completar' : 'cancelar';
    const confirm = await alertService.showConfirm(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} Pedido?`,
      `¿Estás seguro que deseas ${action} el pedido #${id}?`,
      status === 'completada' ? 'Completar' : 'Cancelar',
      'Volver'
    );
    
    if (confirm) {
      try {
        await orderService.updateOrderStatus(id, status);
        alertService.showToast('success', `Pedido ${status === 'completada' ? 'completado' : 'cancelado'}`);
        if (status === 'completada') {
          notifyStockChange();
        }
        void loadData();
      } catch (error) {
        alertService.showToast('error', 'Error al actualizar el pedido');
      }
    }
  };

  const handleCreateOrder = async (items: { cod_prod: number; cantidad: number; precio_unit: number }[]) => {
    setIsSubmitting(true);
    try {
      const dto: CreateOrderDto = {
        metodopago_usu: 'Efectivo',
        items
      };
      await orderService.createCompletedSale(dto);
      
      alertService.showToast('success', 'Venta registrada e inventario actualizado');
      notifyStockChange();
      void loadData();
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Error al procesar la venta');
      alertService.showToast('error', msg);
      
      // Refresh list even on error because a "pendiente" order might have been created
      void loadData();
      
      console.error('Error en Nueva Venta:', error);
      throw error; 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      // Fetch full order to ensure items are present
      const fullOrder = await orderService.getOrderById(order.id_vent);
      setSelectedOrder(fullOrder);
      setIsDetailDrawerOpen(true);
    } catch (error) {
       // Fallback to what we have if network fails for single order
       setSelectedOrder(order);
       setIsDetailDrawerOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Historial de Ventas</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExportOpen(true)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <svg className="mr-2 inline-block h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </button>
          <button 
            onClick={() => setIsOrderDrawerOpen(true)}
            className="rounded-xl bg-[#ec131e] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] active:scale-95"
          >
            Nueva Venta
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100"></div>
          ))
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            No hay ventas registradas.
          </div>
        ) : (
          (Array.isArray(orders) ? orders : []).map((order) => (
            <article 
              key={order.id_vent} 
              onClick={() => handleViewDetails(order)}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md cursor-pointer group/card"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover/card:bg-[#ec131e]/5 group-hover/card:text-[#ec131e] transition-colors">
                   <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 leading-none group-hover/card:text-[#ec131e] transition-colors">Orden #{order.id_vent}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.estado)}`}>
                      {order.estado}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    {new Date(order.fecha_vent).toLocaleString('es-CO', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {order.metodopago_usu || 'Efectivo'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.montofinal_vent)}
                  </p>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-[#ec131e] opacity-0 group-hover/card:opacity-100 transition-opacity">
                    Ver Detalles
                  </span>
                </div>
                
                {order.estado === 'pendiente' && (
                  <div 
                    className="flex gap-2 border-l border-slate-100 pl-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => handleUpdateStatus(order.id_vent, 'completada')}
                      className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 hover:bg-emerald-100 transition-all"
                      title="Completar Venta"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(order.id_vent, 'cancelada')}
                      className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100 transition-all"
                      title="Cancelar Venta"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <OrderDrawer 
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        onOrderCreated={loadData}
        onSubmit={handleCreateOrder}
        isSubmitting={isSubmitting}
      />

      <OrderDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        order={selectedOrder}
      />

      <SalesExportDrawer 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
