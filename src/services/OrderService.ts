import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { Order, Invoice, Paginated } from '../models/Order';

export interface CreateOrderDto {
  metodopago_usu: string;
  items: { cod_prod: number; cantidad: number; precio_unit: number; nom_prod?: string }[];
}

export class OrderService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private get baseURL(): string {
    return this.httpClient.baseURL;
  }

  // ── Orders ──────────────────────────────────────────────────────────────────

  async getOrders(page = 1, limit = 20): Promise<Paginated<Order>> {
    const res = await this.httpClient.get<Paginated<Order>>(
      `/orders?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener ventas');
    return res.data ?? { data: [] };
  }

  async getOrderById(id: number): Promise<Order> {
    const res = await this.httpClient.get<Order>(`/orders/${id}`, this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Venta no encontrada');
    return res.data;
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const res = await this.httpClient.post<Order>('/orders', dto, { headers: this.getAuthHeaders() });
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al crear venta');
    return res.data;
  }

  async updateOrderStatus(id: number, estado: 'pendiente' | 'completada' | 'cancelada' | 'reembolsada'): Promise<Order> {
    const res = await this.httpClient.patch<Order>(
      `/orders/${id}/status`,
      { estado },
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar estado');
    return res.data;
  }

  async deleteOrder(id: number): Promise<void> {
    const res = await this.httpClient.delete(`/orders/${id}`, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(res.error ?? 'Error al eliminar venta');
  }

  // ── Export ──────────────────────────────────────────────────────────────────

  private async downloadBlob(path: string, fileName: string): Promise<void> {
    const token = this.authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseURL}${path}`, { headers });
    if (!res.ok) throw new Error('Error al exportar archivo');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportExcel(): Promise<void> {
    await this.downloadBlob('/orders/export/excel', `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async exportPdf(): Promise<void> {
    await this.downloadBlob('/orders/export/pdf', `ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ── Invoices ─────────────────────────────────────────────────────────────────

  async getInvoices(page = 1, limit = 20): Promise<Paginated<Invoice>> {
    const res = await this.httpClient.get<Paginated<Invoice>>(
      `/invoices?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener facturas');
    return res.data ?? { data: [] };
  }

  async getInvoiceById(id: number): Promise<Invoice> {
    const res = await this.httpClient.get<Invoice>(`/invoices/${id}`, this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Factura no encontrada');
    return res.data;
  }

  async createInvoice(dto: {
    fk_id_vent: number;
    id_usu: number;
    cantidad_vent: number;
    precio_prod: number;
    montototal_vent: number;
  }): Promise<Invoice> {
    const res = await this.httpClient.post<Invoice>('/invoices', dto, { headers: this.getAuthHeaders() });
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al emitir factura');
    return res.data;
  }
}
