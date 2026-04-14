import { type IHttpClient } from '../core/http/HttpClient';
import type { Order, CreateOrderDto, Invoice } from '../models/Order';
import { type AuthService } from './AuthService';
import { type PaginatedResponse } from '../models/Pagination';

export class OrderService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ── Orders ───────────────────────────────────────────────────────────────

  async fetchOrders(limit: number = 20, offset: number = 0): Promise<Order[]> {
    const response = await this.httpClient.get<PaginatedResponse<Order>>(
      `/orders?limit=${limit}&offset=${offset}`,
      this.getAuthHeaders()
    );
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar órdenes');
    return response.data?.data || [];
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await this.httpClient.get<Order>(`/orders/${id}`, this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Orden no encontrada');
    return response.data;
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const response = await this.httpClient.post<Order>('/orders', dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al crear orden');
    return response.data;
  }

  async createCompletedSale(dto: CreateOrderDto): Promise<Order> {
    const order = await this.createOrder(dto);
    try {
      return await this.updateOrderStatus(order.id_vent, 'completada');
    } catch (error) {
      // Best effort rollback to avoid leaving accidental pending orders.
      try {
        await this.updateOrderStatus(order.id_vent, 'cancelada');
      } catch {
        // Keep original failure as the root cause.
      }
      throw error;
    }
  }

  async updateOrderStatus(id: number, estado: 'pendiente' | 'completada' | 'cancelada'): Promise<Order> {
    const response = await this.httpClient.patch<Order>(`/orders/${id}/status`, { estado }, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al actualizar estado');
    return response.data;
  }

  // ── Invoices ─────────────────────────────────────────────────────────────

  async fetchInvoices(): Promise<Invoice[]> {
    const response = await this.httpClient.get<PaginatedResponse<Invoice>>('/invoices', this.getAuthHeaders());
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar facturas');
    return response.data?.data || [];
  }

  async getInvoiceByOrderId(orderId: number): Promise<Invoice | null> {
    const response = await this.httpClient.get<Invoice>(`/invoices/order/${orderId}`, this.getAuthHeaders());
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(response.error ?? 'Error al buscar factura');
    return response.data;
  }

  getExportUrl(format: 'pdf' | 'excel'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${baseUrl}/orders/export/${format === 'excel' ? 'excel' : 'pdf'}`;
  }

  async downloadExport(format: 'pdf' | 'excel'): Promise<Blob> {
    const url = `/orders/export/${format === 'excel' ? 'excel' : 'pdf'}`;
    return this.httpClient.download(url, this.getAuthHeaders());
  }
}
