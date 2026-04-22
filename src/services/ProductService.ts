import { type IHttpClient } from '../core/http/HttpClient';
import { type AuthService } from './AuthService';
import type { Product, Category, PaginatedProducts } from '../models/Product';

export class ProductService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Products
  async getProducts(page: number = 1, limit: number = 20): Promise<PaginatedProducts> {
    const response = await this.httpClient.get<PaginatedProducts>(
      `/products?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving products');
    return response.data;
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.httpClient.get<Product>(`/products/${id}`, this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving product');
    return response.data;
  }

  async createProduct(product: Partial<Product> | FormData): Promise<Product> {
    const response = await this.httpClient.post<Product>('/products', product, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error creating product');
    return response.data;
  }

  async updateProduct(id: number, product: Partial<Product> | FormData): Promise<Product> {
    const response = await this.httpClient.put<Product>(`/products/${id}`, product, { headers: this.getAuthHeaders() });
    if (!response.ok || !response.data) throw new Error(response.error || 'Error updating product');
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    const response = await this.httpClient.delete(`/products/${id}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(response.error || 'Error deleting product');
  }

  async getLowStock(): Promise<{ data: Product[] }> {
    const response = await this.httpClient.get<{ data: Product[] }>('/products/low-stock', this.getAuthHeaders());
    if (!response.ok || !response.data) throw new Error(response.error || 'Error retrieving low stock products');
    return response.data;
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
