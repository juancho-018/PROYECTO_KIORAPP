import { type IHttpClient } from '../core/http/HttpClient';
import type { User } from '../models/User';

export interface LoginCredentials {
  correo_usu: string;
  password?: string;
}

export interface AuthData {
  token: string;
  usuario: User;
}

/**
 * Service to handle Authentication logic (SRP).
 */
export class AuthService {
  constructor(private httpClient: IHttpClient) {}

  async login(credentials: LoginCredentials): Promise<AuthData> {
    const response = await this.httpClient.post<AuthData>('/auth/login', credentials, {
      credentials: 'include' // needed for HttpOnly cookies or CORS
    });

    if (!response.ok || !response.data) {
      throw new Error(response.error ?? 'Error desconocido al iniciar sesión');
    }

    this.saveSession(response.data.token, response.data.usuario);
    return response.data;
  }

  async refreshToken(): Promise<string | null> {
    const response = await this.httpClient.post<{ token: string }>('/auth/refresh', undefined, {
      credentials: 'include'
    });
    
    if (response.ok && response.data?.token) {
      this.saveSession(response.data.token, this.getUser());
      return response.data.token;
    }
    return null;
  }

  logout() {
    this.clearSession();
    window.location.href = '/login';
  }

  saveSession(token: string, user: User | null) {
    if (user) {
      localStorage.setItem('kiora_token', token);
      localStorage.setItem('kiora_user', typeof user === 'string' ? user : JSON.stringify(user));
    }
  }

  clearSession() {
    localStorage.removeItem('kiora_token');
    localStorage.removeItem('kiora_user');
  }

  getToken(): string | null {
    return localStorage.getItem('kiora_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('kiora_user');
    return userStr ? (JSON.parse(userStr) as User) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
