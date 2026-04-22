import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { Product, Category, PaginatedProducts } from '../models/Product';

export interface CreateProductDto {
  nom_prod: string;
  desc_prod?: string;
  precio_prod: number;
  stock_actual?: number;
  stock_minimo?: number;
  fk_cod_cats?: number[];
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

  private ensureArray<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  }

  private normalizeProduct(p: any): Product {
    return {
      ...p,
      precio_prod: p.precio_prod ?? p.precio_unitario ?? 0,
      desc_prod: p.desc_prod ?? p.descrip_prod,
      imagen_prod: p.imagen_prod ?? p.url_imagen,
      fk_cod_cats: p.fk_cod_cats || (p.fk_cod_cat ? [p.fk_cod_cat] : [])
    };
  }

  // Products
  async getProducts(page: number = 1, limit: number = 20): Promise<Product[] | PaginatedProducts> {
    const response = await this.httpClient.get<any>(
      `/products?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!response.ok || !response.data) {
      console.error('HTTP Error Response:', response);
      throw new Error(response.error || 'Error retrieving products');
    }
    
    const data = response.data;
    if (Array.isArray(data)) {
        return data.map(p => this.normalizeProduct(p));
    }
    
    if (data.data && Array.isArray(data.data)) {
        return {
            ...data,
            data: data.data.map((p: any) => this.normalizeProduct(p))
        };
    }

    return [];
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.httpClient.get<Product>(`/products/${id}`, this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving product');
    return this.normalizeProduct(response.data);
  }

  async getLowStockProducts(): Promise<Product[]> {
    const response = await this.httpClient.get<any>('/products/low-stock', this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving low stock products');
    return this.ensureArray<any>(response.data).map(p => this.normalizeProduct(p));
  }

  // Alias for backward compatibility with older components
  async getLowStock(): Promise<{ data: Product[] }> {
    const data = await this.getLowStockProducts();
    return { data };
  }

  async createProduct(dto: CreateProductDto | FormData): Promise<Product> {
    const body = this.prepareBody(dto);
    const response = await this.httpClient.post<Product>('/products', body, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error creating product');
    return this.normalizeProduct(response.data);
  }

  async updateProduct(id: number, dto: CreateProductDto | FormData): Promise<Product> {
    const body = this.prepareBody(dto);
    const response = await this.httpClient.put<Product>(`/products/${id}`, body, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error updating product');
    return this.normalizeProduct(response.data);
  }

  private prepareBody(dto: CreateProductDto | FormData): FormData | any {
    if (dto instanceof FormData) return dto;

    const hasImage = !!dto.imagen;
    if (hasImage) {
      const fd = new FormData();
      fd.append('nom_prod', dto.nom_prod);
      if (dto.desc_prod) fd.append('descrip_prod', dto.desc_prod);
      fd.append('precio_unitario', dto.precio_prod.toString());
      if (dto.stock_actual !== undefined) fd.append('stock_actual', dto.stock_actual.toString());
      if (dto.stock_minimo !== undefined) fd.append('stock_minimo', dto.stock_minimo.toString());
      if (dto.fk_cod_cats) fd.append('fk_cod_cats', JSON.stringify(dto.fk_cod_cats));
      if (dto.imagen) fd.append('imagen', dto.imagen);
      return fd;
    }

    return {
      nom_prod: dto.nom_prod,
      descrip_prod: dto.desc_prod,
      precio_unitario: dto.precio_prod,
      stock_actual: dto.stock_actual,
      stock_minimo: dto.stock_minimo,
      fk_cod_cats: dto.fk_cod_cats
    };
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/products/${id}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(response.error || 'Error deleting product');
  }

  // Categories
  async getCategories(page: number = 1, limit: number = 100): Promise<{ data: Category[], pagination: any }> {
    const response = await this.httpClient.get<any>(
      `/categories?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving categories');
    return response.data;
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const response = await this.httpClient.post<Category>('/categories', category, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error creating category');
    return response.data;
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const response = await this.httpClient.put<Category>(`/categories/${id}`, category, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error updating category');
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/categories/${id}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(response.error || 'Error deleting category');
  }
}
