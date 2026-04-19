import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { Product, Category } from '../models/Product';

export interface CreateProductDto {
  nom_prod: string;
  desc_prod?: string;
  precio_prod: number;
  stock_actual?: number;
  stock_minimo?: number;
  fk_cod_cat?: number;
  imagen?: File;
  tipos_prod?: string[];
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

  /**
   * Normalizes response to always return an array
   */
  private ensureArray<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  }

  // ── Products ────────────────────────────────────────────────────────────────

  async getProducts(filters?: Record<string, any>): Promise<Product[]> {
    let url = '/products';
    if (filters) {
      const qs = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.append(k, Array.isArray(v) ? v.join(',') : String(v));
        }
      });
      if (qs.toString()) url += `?${qs.toString()}`;
    }
    const res = await this.httpClient.get<any>(url, this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener productos');
    return this.ensureArray<any>(res.data).map(p => ({
       ...p,
       precio_prod: p.precio_unitario,
       fk_cod_cat: p.fk_cod_cat,
       desc_prod: p.descrip_prod,
       imagen_prod: p.url_imagen,
       tipos_prod: p.tipos_prod
    }));
  }

  async getProductById(id: number): Promise<Product> {
    const res = await this.httpClient.get<Product>(`/products/${id}`, this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Producto no encontrado');
    const p = res.data as any;
    return {
       ...p,
       precio_prod: p.precio_unitario,
       fk_cod_cat: p.fk_cod_cat,
       desc_prod: p.descrip_prod,
       imagen_prod: p.url_imagen
    };
  }

  async getLowStockProducts(): Promise<Product[]> {
    const res = await this.httpClient.get<any>('/products/low-stock', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener productos con bajo stock');
    return this.ensureArray<any>(res.data).map(p => ({
       ...p,
       precio_prod: p.precio_unitario !== undefined ? p.precio_unitario : 0,
       fk_cod_cat: p.fk_cod_cat,
       desc_prod: p.descrip_prod,
       imagen_prod: p.url_imagen
    }));
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const formData = new FormData();
    formData.append('nom_prod', dto.nom_prod);
    formData.append('precio_unitario', String(dto.precio_prod));
    if (dto.desc_prod) formData.append('descrip_prod', dto.desc_prod);
    if (dto.stock_actual !== undefined) formData.append('stock_actual', String(dto.stock_actual));
    if (dto.stock_minimo !== undefined) formData.append('stock_minimo', String(dto.stock_minimo));
    if (dto.fk_id_cat !== undefined) formData.append('fk_cod_cat', String(dto.fk_id_cat));
    if (dto.tipos_prod) formData.append('tipos_prod', JSON.stringify(dto.tipos_prod));
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
    formData.append('precio_unitario', String(dto.precio_prod));
    if (dto.desc_prod) formData.append('descrip_prod', dto.desc_prod);
    if (dto.stock_actual !== undefined) formData.append('stock_actual', String(dto.stock_actual));
    if (dto.stock_minimo !== undefined) formData.append('stock_minimo', String(dto.stock_minimo));
    if (dto.fk_id_cat !== undefined) formData.append('fk_cod_cat', String(dto.fk_id_cat));
    if (dto.tipos_prod) formData.append('tipos_prod', JSON.stringify(dto.tipos_prod));
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
    const cleanId = String(id).trim();
    const res = await this.httpClient.put<Product>(
      `/products/${cleanId}/stock`,
      { cantidad },
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar stock');
    return res.data;
  }

  // ── Categories ──────────────────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    const res = await this.httpClient.get<any>('/categories', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener categorías');
    return this.ensureArray<any>(res.data).map(c => ({
      ...c,
      cod_cat: c.cod_cat
    }));
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
    const res = await this.httpClient.put<Category>(
      `/categories/${id}`,
      { nom_cat, desc_cat },
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar categoría');
    return res.data;
  }

  async deleteCategory(id: number): Promise<void> {
    const res = await this.httpClient.delete(`/categories/${id}`, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(res.error ?? 'Error al eliminar categoría');
  }
}
