import { type IHttpClient } from '../core/http/HttpClient';
import { type AuthService } from './AuthService';

/**
 * Service to manage User logic like fetching users or unlocking them (SRP).
 */
export class UserService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async fetchUsers(): Promise<any[]> {
    const response = await this.httpClient.get<any>('/auth/users', this.getAuthHeaders());
    if (!response.ok) {
      throw new Error(response.error ?? 'Error al consultar usuarios');
    }
    // Backend API sometimes wraps the response array inside a "data" field
    return response.data?.data || response.data || [];
  }

  async unlockUser(id: string): Promise<boolean> {
    const response = await this.httpClient.patch<any>(`/auth/users/${id}/unlock`, undefined, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(response.error ?? 'Error al desbloquear usuario');
    }
    return true;
  }

  isUserBlocked(user: any): boolean {
    if (user.intentos_fallidos && user.intentos_fallidos >= 5) return true;
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) return true;
    return false;
  }
}
