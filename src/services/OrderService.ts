import { type IHttpClient } from '../core/http/HttpClient';
import { type AuthService } from './AuthService';
import type { Order, PaginatedOrders, Invoice } from '../models/Order';

export class OrderService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Orders (Sales)
  async getOrders(page: number = 1, limit: number = 20): Promise<PaginatedOrders> {
    const response = await this.httpClient.get<PaginatedOrders>(
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

  async createOrder(id_usu: number, items: any[] = []): Promise<Order> {
    const response = await this.httpClient.post<Order>('/orders', { id_usu, items }, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error creating order');
    return response.data;
  }

  async updateOrderStatus(id: number, estado: string): Promise<Order> {
    const response = await this.httpClient.put<Order>(`/orders/${id}/status`, { estado }, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error updating order status');
    return response.data;
  }

  async deleteOrder(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/orders/${id}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(response.error || 'Error deleting order');
  }

  // Invoices
  async getInvoices(page: number = 1, limit: number = 50): Promise<{ data: Invoice[], pagination: any }> {
    const response = await this.httpClient.get<any>(`/invoices?page=${page}&limit=${limit}`, this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving invoices');
    return response.data;
  }

  async createInvoice(id_pedido: number, total_fact: number): Promise<Invoice> {
    const response = await this.httpClient.post<Invoice>('/invoices', { id_pedido, total_fact }, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error creating invoice');
    return response.data;
  }
}
