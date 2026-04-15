import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { Product, Category } from '../models/Product';

export interface CreateProductDto {
  nom_prod: string;
  desc_prod?: string;
  precio_prod: number;
  stock_actual?: number;
  stock_minimo?: number;
  fk_id_cat?: number;
  imagen?: File;
}

export class ProductService {
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

  // ── Products ────────────────────────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    const res = await this.httpClient.get<Product[]>('/products', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener productos');
    return res.data ?? [];
  }

  async getProductById(id: number): Promise<Product> {
    const res = await this.httpClient.get<Product>(`/products/${id}`, this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Producto no encontrado');
    return res.data;
  }

  async getLowStockProducts(): Promise<Product[]> {
    const res = await this.httpClient.get<Product[]>('/products/low-stock', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener productos con bajo stock');
    return res.data ?? [];
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const formData = new FormData();
    formData.append('nom_prod', dto.nom_prod);
    formData.append('precio_prod', String(dto.precio_prod));
    if (dto.desc_prod) formData.append('desc_prod', dto.desc_prod);
    if (dto.stock_actual !== undefined) formData.append('stock_actual', String(dto.stock_actual));
    if (dto.stock_minimo !== undefined) formData.append('stock_minimo', String(dto.stock_minimo));
    if (dto.fk_id_cat !== undefined) formData.append('fk_id_cat', String(dto.fk_id_cat));
    if (dto.imagen) formData.append('imagen', dto.imagen);

    const token = this.authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseURL}/products`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) throw new Error((data?.error ?? data?.message ?? 'Error al crear producto') as string);
    return data as unknown as Product;
  }

  async updateProduct(id: number, dto: CreateProductDto): Promise<Product> {
    const formData = new FormData();
    formData.append('nom_prod', dto.nom_prod);
    formData.append('precio_prod', String(dto.precio_prod));
    if (dto.desc_prod) formData.append('desc_prod', dto.desc_prod);
    if (dto.stock_actual !== undefined) formData.append('stock_actual', String(dto.stock_actual));
    if (dto.stock_minimo !== undefined) formData.append('stock_minimo', String(dto.stock_minimo));
    if (dto.fk_id_cat !== undefined) formData.append('fk_id_cat', String(dto.fk_id_cat));
    if (dto.imagen) formData.append('imagen', dto.imagen);

    const token = this.authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseURL}/products/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) throw new Error((data?.error ?? data?.message ?? 'Error al actualizar producto') as string);
    return data as unknown as Product;
  }

  async deleteProduct(id: number): Promise<void> {
    const res = await this.httpClient.delete(`/products/${id}`, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(res.error ?? 'Error al eliminar producto');
  }

  async updateStock(id: number, cantidad: number): Promise<Product> {
    const res = await this.httpClient.patch<Product>(
      `/products/${id}/stock`,
      { cantidad },
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar stock');
    return res.data;
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    const res = await this.httpClient.get<Category[]>('/categories', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener categorías');
    return res.data ?? [];
  }

  async createCategory(nom_cat: string, desc_cat?: string): Promise<Category> {
    const res = await this.httpClient.post<Category>(
      '/categories',
      { nom_cat, desc_cat },
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al crear categoría');
    return res.data;
  }

  async updateCategory(id: number, nom_cat: string, desc_cat?: string): Promise<Category> {
    const token = this.authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const rawRes = await fetch(`${this.baseURL}/categories/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ nom_cat, desc_cat }),
    });
    const data = (await rawRes.json()) as Record<string, unknown>;
    if (!rawRes.ok) throw new Error((data?.error ?? data?.message ?? 'Error al actualizar categoría') as string);
    return data as unknown as Category;
  }

  async deleteCategory(id: number): Promise<void> {
    const res = await this.httpClient.delete(`/categories/${id}`, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(res.error ?? 'Error al eliminar categoría');
  }
}
