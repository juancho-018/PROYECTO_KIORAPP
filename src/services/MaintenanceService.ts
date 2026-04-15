import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { MaintenanceReport } from '../models/Maintenance';

export class MaintenanceService {
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

  private async downloadBlob(path: string, fileName: string): Promise<void> {
    const token = this.authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseURL}${path}`, { headers });
    if (!res.ok) throw new Error('Error al exportar archivo');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async getReports(): Promise<MaintenanceReport[]> {
    const res = await this.httpClient.get<MaintenanceReport[]>('/maintenance', this.getAuthHeaders());
    if (!res.ok) throw new Error(res.error ?? 'Error al obtener reportes');
    return res.data ?? [];
  }

  async createReport(
    dto: Omit<MaintenanceReport, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>
  ): Promise<MaintenanceReport> {
    const res = await this.httpClient.post<MaintenanceReport>(
      '/maintenance',
      dto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al crear reporte');
    return res.data;
  }

  async updateReport(id: number, dto: Partial<MaintenanceReport>): Promise<MaintenanceReport> {
    const res = await this.httpClient.patch<MaintenanceReport>(
      `/maintenance/${id}`,
      dto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar reporte');
    return res.data;
  }

  async exportExcel(): Promise<void> {
    await this.downloadBlob('/maintenance/export/excel', `mantenimiento_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async exportPdf(): Promise<void> {
    await this.downloadBlob('/maintenance/export/pdf', `mantenimiento_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
