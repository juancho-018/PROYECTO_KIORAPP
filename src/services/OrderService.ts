import { type IHttpClient } from '../core/http/HttpClient';
import { type AuthService } from './AuthService';
import type { Order, PaginatedOrders, Invoice, Paginated } from '../models/Order';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CreateOrderDto {
  metodopago_usu: string;
  items: { cod_prod: number; cantidad: number; precio_unit: number; nom_prod?: string; url_imagen?: string }[];
}

export class OrderService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private get baseURL(): string {
    return this.httpClient.baseURL;
  }

  // Orders (Sales)
  async getOrders(page: number = 1, limit: number = 20): Promise<PaginatedOrders | Order[]> {
    const response = await this.httpClient.get<any>(
      `/orders?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving orders');
    return response.data;
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await this.httpClient.get<Order>(`/orders/${id}`, this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving order details');
    return response.data;
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const cleanDto = {
      ...dto,
      items: dto.items.map(item => ({
        cod_prod: item.cod_prod,
        cantidad: item.cantidad,
        precio_unit: item.precio_unit,
        nom_prod: item.nom_prod
      }))
    };
    const res = await this.httpClient.post<Order>('/orders', cleanDto, { headers: this.getAuthHeaders() });
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al crear venta');
    return res.data;
  }

  async updateOrderStatus(id: number, estado: 'pendiente' | 'completada' | 'cancelada' | 'reembolsada'): Promise<Order> {
    const res = await this.httpClient.put<Order>(
      `/orders/${id}/status`,
      { estado },
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar estado');
    return res.data;
  }

  async deleteOrder(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/orders/${id}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(response.error || 'Error deleting order');
  }

  async createCheckoutSession(orderId: number): Promise<{ checkoutUrl: string }> {
    const res = await this.httpClient.post<any>(
      `/orders/checkout/${orderId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al generar sesión de pago');
    return res.data;
  }

  // Export
  async exportPdf(): Promise<void> {
    try {
      const res = await this.getOrders(1, 1000);
      const orders = Array.isArray(res) ? res : (res.data || []);

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(236, 19, 30);
      doc.text('KIORA - Reporte de Ventas', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 28);

      const tableData = orders.map(o => [
        `#${o.id_vent}`,
        o.fecha_vent ? new Date(o.fecha_vent).toLocaleDateString() : '—',
        (o.metodopago_usu || 'Efectivo').toUpperCase(),
        (o.estado || 'Pendiente').toUpperCase(),
        `$${Number(o.montofinal_vent || 0).toLocaleString('es-CO')}`
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['ID', 'Fecha', 'Método Pago', 'Estado', 'Monto']],
        body: tableData,
        headStyles: { fillColor: [236, 19, 30] },
      });

      doc.save(`kiora_ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      throw new Error('Error al generar PDF de ventas');
    }
  }

  async downloadReceipt(orderId: number): Promise<void> {
    const order = await this.getOrderById(orderId);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('KIORA', 40, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Recibo de Compra #${order.id_vent}`, 5, 32);
    doc.text(`Fecha: ${order.fecha_vent ? new Date(order.fecha_vent).toLocaleString('es-CO') : '—'}`, 5, 37);

    let y = 45;
    doc.setFontSize(8);
    (order.items || []).forEach(item => {
       doc.text((item.nom_prod || 'Producto').substring(0, 15), 5, y);
       doc.text(item.cantidad?.toString() || '1', 45, y);
       doc.text(`$${Number(item.precio_unit).toLocaleString('es-CO')}`, 55, y);
       y += 5;
    });

    y += 10;
    doc.setFontSize(10);
    doc.text('TOTAL:', 5, y);
    doc.text(`$${Number(order.montofinal_vent).toLocaleString('es-CO')}`, 75, y, { align: 'right' });

    doc.save(`ticket_${order.id_vent}.pdf`);
  }

  // Invoices
  async getInvoices(page = 1, limit = 20): Promise<Paginated<Invoice>> {
    const res = await this.httpClient.get<Paginated<Invoice>>(
      `/invoices?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!res.ok) {
      if (res.status === 404) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      throw new Error(res.error ?? 'Error al obtener facturas');
    }
    return res.data ?? { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }

  async createInvoice(dto: any): Promise<Invoice> {
    const res = await this.httpClient.post<Invoice>('/invoices', dto, { headers: this.getAuthHeaders() });
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al emitir factura');
    return res.data;
  }
}
