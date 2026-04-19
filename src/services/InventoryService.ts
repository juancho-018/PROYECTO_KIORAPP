import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { Supplier, Movement, Suministra, LowStockItem } from '../models/Inventory';

export class InventoryService {
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

  private ensureArray<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  }

  // ── Suppliers ───────────────────────────────────────────────────────────────

  async getSuppliers(): Promise<Supplier[]> {
    const res = await this.httpClient.get<any>('/inventory/suppliers', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener proveedores');
    return this.ensureArray<Supplier>(res.data);
  }

  async getSupplierById(id: number): Promise<Supplier> {
    const res = await this.httpClient.get<Supplier>(`/inventory/suppliers/${id}`, this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Proveedor no encontrado');
    return res.data;
  }

  async createSupplier(dto: Omit<Supplier, 'cod_prov'>): Promise<Supplier> {
    const res = await this.httpClient.post<Supplier>(
      '/inventory/suppliers',
      dto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al crear proveedor');
    return res.data;
  }

  async updateSupplier(id: number, dto: Partial<Supplier>): Promise<Supplier> {
    const res = await this.httpClient.put<Supplier>(
      `/inventory/suppliers/${id}`,
      dto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar proveedor');
    return res.data;
  }

  async deleteSupplier(id: number): Promise<void> {
    const res = await this.httpClient.delete(`/inventory/suppliers/${id}`, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(res.error ?? 'Error al eliminar proveedor');
  }

  // ── Movements ───────────────────────────────────────────────────────────────

  async getMovements(cod_prod?: number): Promise<Movement[]> {
    const query = cod_prod ? `?cod_prod=${cod_prod}` : '';
    const res = await this.httpClient.get<any>(`/inventory/movements${query}`, this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener movimientos');
    return this.ensureArray<any>(res.data).map(m => ({
      ...m,
      fk_cod_prod: m.cod_prod,
      cantidad_mov: m.cantidad
    }));
  }

  async createMovement(dto: Omit<Movement, 'id_mov' | 'fecha_mov'>): Promise<Movement> {
    const backendDto = {
       ...dto,
       cod_prod: dto.fk_cod_prod,
       cantidad: dto.cantidad_mov
    };
    const res = await this.httpClient.post<Movement>(
      '/inventory/movements',
      backendDto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al registrar movimiento');
    return res.data;
  }

  // ── Low Stock ───────────────────────────────────────────────────────────────

  async getLowStock(): Promise<LowStockItem[]> {
    const res = await this.httpClient.get<any>('/inventory/low-stock', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener items con bajo stock');
    return this.ensureArray<LowStockItem>(res.data);
  }

  // ── Suministra ──────────────────────────────────────────────────────────────

  async getSuministra(): Promise<Suministra[]> {
    const res = await this.httpClient.get<any>('/inventory/suministra', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener suministra');
    return this.ensureArray<Suministra>(res.data);
  }

  async getSuministraById(id: number): Promise<Suministra> {
    const res = await this.httpClient.get<Suministra>(`/inventory/suministra/${id}`, this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Suministra no encontrado');
    return res.data;
  }

  async upsertSuministra(dto: { fk_cod_prov: number; cod_prod: number; stock: number; stock_minimo: number }): Promise<Suministra> {
    const res = await this.httpClient.post<Suministra>(
      '/inventory/suministra',
      dto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al guardar suministra');
    return res.data;
  }
}
