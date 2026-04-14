import { type IHttpClient } from '../core/http/HttpClient';
import { type AuthService } from './AuthService';
import { type PaginatedResponse } from '../models/Pagination';
import type { MaintenanceReport, CreateReportDto } from '../models/Maintenance';

export class MaintenanceService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async fetchReports(page: number = 1, limit: number = 20): Promise<PaginatedResponse<MaintenanceReport>> {
    const response = await this.httpClient.get<PaginatedResponse<MaintenanceReport>>(
      `/maintenance?page=${page}&limit=${limit}`,
      this.getAuthHeaders()
    );
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al cargar reportes');
    return response.data;
  }

  async createReport(dto: CreateReportDto): Promise<MaintenanceReport> {
    const response = await this.httpClient.post<MaintenanceReport>('/maintenance', dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al crear reporte');
    return response.data;
  }

  async updateReport(id: number, dto: Partial<MaintenanceReport>): Promise<MaintenanceReport> {
    const response = await this.httpClient.patch<MaintenanceReport>(`/maintenance/${id}`, dto, {
      headers: this.getAuthHeaders()
    });
    if (!response.ok || !response.data) throw new Error(response.error ?? 'Error al actualizar reporte');
    return response.data;
  }

  getExportUrl(format: 'pdf' | 'excel'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${baseUrl}/maintenance/export/${format === 'excel' ? 'excel' : 'pdf'}`;
  }

  async downloadExport(format: 'pdf' | 'excel'): Promise<Blob> {
    const url = `/maintenance/export/${format === 'excel' ? 'excel' : 'pdf'}`;
    return this.httpClient.download(url, this.getAuthHeaders());
  }
}
