import { type IHttpClient } from '../core/http/HttpClient';
import { type AuthService } from './AuthService';
import type { User } from '../models/User';

export interface PaginatedUsers {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegisterUserDto {
  nom_usu: string;
  correo_usu: string;
  password?: string;
  tel_usu?: string;
  rol_usu?: string;
}

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

  async fetchUsers(page: number = 1, limit: number = 10): Promise<PaginatedUsers> {
    const response = await this.httpClient.get<PaginatedUsers>(`/auth/users?page=${page}&limit=${limit}`, this.getAuthHeaders());
    if (!response.ok) {
      throw new Error(response.error ?? 'Error al consultar usuarios');
    }
    
    // Si el backend devuelve el objeto completo { data, pagination }
    if (response.data && 'pagination' in (response.data as any)) {
      return response.data as unknown as PaginatedUsers;
    }
    
    // Fallback por si la respuesta vino vacía o diferente
    return {
      data: (response.data as unknown as { data?: User[] })?.data || (response.data as unknown as User[]) || [],
      pagination: { page, limit, total: 0, totalPages: 0 }
    };
  }

  async registerUser(dto: RegisterUserDto): Promise<void> {
    const defaultPassword = dto.password || Math.random().toString(36).slice(-8); // Contraseña por defecto si no se pasa
    const payload = { ...dto, password: defaultPassword };
    
    // Se asume que /auth/register recibe el body en minúsculas y está protegido por isAdmin según el authController
    const response = await this.httpClient.post<any>('/auth/register', payload, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(response.error ?? 'Error al registrar el nuevo usuario');
    }
  }

  async unlockUser(id: string): Promise<boolean> {
    const response = await this.httpClient.patch<User>(`/auth/users/${id}/unlock`, undefined, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(response.error ?? 'Error al desbloquear usuario');
    }
    return true;
  }

  isUserBlocked(user: User): boolean {
    if (user.intentos_fallidos && user.intentos_fallidos >= 5) return true;
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) return true;
    return false;
  }
}
