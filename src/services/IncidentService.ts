import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { Incident, CreateIncidentDto } from '../models/Incident';

export class IncidentService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getIncidents(): Promise<Incident[]> {
    const res = await this.httpClient.get<Incident[]>('/incidents', this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al obtener incidencias');
    return res.data;
  }

  async createIncident(dto: CreateIncidentDto): Promise<Incident> {
    const res = await this.httpClient.post<Incident>('/incidents', dto, {
      headers: this.getAuthHeaders()
    });
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al crear incidencia');
    return res.data;
  }

  async updateIncidentStatus(id: number, estado: Incident['estado']): Promise<Incident> {
    const res = await this.httpClient.put<Incident>(
      `/incidents/${id}/estado`,
      { estado },
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar estado de la incidencia');
    return res.data;
  }
}
