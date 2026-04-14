import { type IHttpClient } from '../core/http/HttpClient';
import type { Product, CreateProductDto, UpdateProductDto } from '../models/Product';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/Category';
import { type AuthService } from './AuthService';
import { type PaginatedResponse } from '../models/Pagination';

export class ProductService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ── Products ──────────────────────────────────────────────────────────────

  async fetchProducts(limit: number = 100, offset: number = 0): Promise<Product[]> {
    const timestamp = new Date().getTime();
    const response = await this.httpClient.get<PaginatedResponse<Product>>(
      `/products?limit=${limit}&offset=${offset}&_t=${timestamp}`,
      this.getAuthHeaders()
    );
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar productos');
    return response.data?.data || [];
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.httpClient.get<Product>(`/products/${id}`, this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Producto no encontrado');
    return response.data;
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const formData = new FormData();
    formData.append('nom_prod', dto.nom_prod);
    if (dto.descrip_prod) formData.append('descrip_prod', dto.descrip_prod);
    formData.append('precio_unitario', dto.precio_unitario.toString());
    formData.append('stock_actual', dto.stock_actual.toString());
    formData.append('stock_minimo', dto.stock_minimo.toString());
    if (dto.fk_cod_cat) formData.append('fk_cod_cat', dto.fk_cod_cat.toString());
    if (dto.imagen) formData.append('imagen', dto.imagen);

    const response = await this.httpClient.post<Product>('/products', formData, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al crear producto');
    return response.data;
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const formData = new FormData();
    if (dto.nom_prod) formData.append('nom_prod', dto.nom_prod);
    if (dto.descrip_prod !== undefined) formData.append('descrip_prod', dto.descrip_prod || '');
    if (dto.precio_unitario !== undefined) formData.append('precio_unitario', dto.precio_unitario.toString());
    if (dto.stock_actual !== undefined) formData.append('stock_actual', dto.stock_actual.toString());
    if (dto.stock_minimo !== undefined) formData.append('stock_minimo', dto.stock_minimo.toString());
    if (dto.fk_cod_cat !== undefined) formData.append('fk_cod_cat', dto.fk_cod_cat?.toString() || '');
    if (dto.imagen) formData.append('imagen', dto.imagen);

    const response = await this.httpClient.put<Product>(`/products/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al actualizar producto');
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/products/${id}`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error(response.error ?? 'Error al eliminar producto');
  }

  async updateStock(id: number, cantidad: number): Promise<Product> {
    const response = await this.httpClient.patch<Product>(`/products/${id}/stock`, { cantidad }, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al actualizar stock');
    return response.data;
  }

  async fetchLowStock(): Promise<Product[]> {
    const timestamp = new Date().getTime();
    const response = await this.httpClient.get<{ data: Product[] }>(`/products/low-stock?_t=${timestamp}`, this.getAuthHeaders());
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar stock bajo');
    // The backend returns { data: [...] }
    return response.data?.data || [];
  }

  // ── Categories ────────────────────────────────────────────────────────────

  async fetchCategories(): Promise<Category[]> {
    const response = await this.httpClient.get<PaginatedResponse<Category>>('/categories', this.getAuthHeaders());
    if (!response.ok) throw new Error(response.error ?? 'Error al cargar categorías');
    return response.data?.data || [];
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const response = await this.httpClient.post<Category>('/categories', dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al crear categoría');
    return response.data;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const response = await this.httpClient.put<Category>(`/categories/${id}`, dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al actualizar categoría');
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/categories/${id}`, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) throw new Error(response.error ?? 'Error al eliminar categoría');
  }
}
