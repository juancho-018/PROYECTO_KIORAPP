import { type IHttpClient } from '../core/http/HttpClient';
import type { Supplier, Movement, Suministra, CreateSupplierDto, CreateMovementDto, UpsertSuministraDto } from '../models/Inventory';
import { type AuthService } from './AuthService';
import { type PaginatedResponse } from '../models/Pagination';

export class InventoryService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ── Suppliers ─────────────────────────────────────────────────────────────

  async fetchSuppliers(): Promise<Supplier[]> {
    const response = await this.httpClient.get<PaginatedResponse<Supplier>>('/inventory/suppliers', this.getAuthHeaders());
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar proveedores');
    return response.data?.data || [];
  }

  async createSupplier(dto: CreateSupplierDto): Promise<Supplier> {
    const response = await this.httpClient.post<Supplier>('/inventory/suppliers', dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al crear proveedor');
    return response.data;
  }

  async updateSupplier(id: number, dto: Partial<CreateSupplierDto>): Promise<Supplier> {
    const response = await this.httpClient.patch<Supplier>(`/inventory/suppliers/${id}`, dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al actualizar proveedor');
    return response.data;
  }

  async deleteSupplier(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/inventory/suppliers/${id}`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error(response.error ?? 'Error al eliminar proveedor');
  }

  // ── Movements ─────────────────────────────────────────────────────────────

  async fetchMovements(cod_prod?: number): Promise<Movement[]> {
    let url = '/inventory/movements';
    if (cod_prod) url += `?cod_prod=${cod_prod}`;
    const response = await this.httpClient.get<PaginatedResponse<Movement>>(url, this.getAuthHeaders());
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar movimientos');
    return response.data?.data || [];
  }

  async createMovement(dto: CreateMovementDto): Promise<Movement> {
    const response = await this.httpClient.post<Movement>('/inventory/movements', dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al registrar movimiento');
    return response.data;
  }

  // ── Suministra (Stock Alerts) ──────────────────────────────────────────────

  async fetchLowStockAlerts(): Promise<Suministra[]> {
    const response = await this.httpClient.get<PaginatedResponse<Suministra> | Suministra[]>('/inventory/low-stock', this.getAuthHeaders());
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar alertas de stock');
    if (Array.isArray(response.data)) return response.data;
    return response.data?.data || [];
  }

  async upsertSuministra(dto: UpsertSuministraDto): Promise<Suministra> {
    const response = await this.httpClient.post<Suministra>('/inventory/suministra', dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al configurar stock');
    return response.data;
  }
}
