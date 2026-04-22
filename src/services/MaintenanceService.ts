import type { IHttpClient } from '../core/http/HttpClient';
import type { AuthService } from './AuthService';
import type { MaintenanceReport } from '../models/Maintenance';

export class MaintenanceService {
  constructor(
    private httpClient: IHttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private get baseURL(): string {
    return this.httpClient.baseURL;
  }

  private ensureArray<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  }

  // ── Reports ─────────────────────────────────────────────────────────────────

  async getReports(): Promise<MaintenanceReport[]> {
    // NOTE: Backend for /maintenance/reports is not implemented yet.
    // const res = await this.httpClient.get<any>('/maintenance/reports', this.getAuthHeaders());
    // if (!res.ok) throw new Error(res.error ?? 'Error al obtener reportes');
    // return this.ensureArray<MaintenanceReport>(res.data);
    console.warn('Backend de reportes de mantenimiento no implementado');
    return [];
  }

  async getReportById(id: number): Promise<MaintenanceReport> {
    const res = await this.httpClient.get<MaintenanceReport>(`/maintenance/reports/${id}`, this.getAuthHeaders());
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Reporte no encontrado');
    return res.data;
  }

  async createReport(dto: Partial<MaintenanceReport>): Promise<MaintenanceReport> {
    const res = await this.httpClient.post<MaintenanceReport>(
      '/maintenance/reports',
      dto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al crear reporte');
    return res.data;
  }

  async updateReport(id: number, dto: Partial<MaintenanceReport>): Promise<MaintenanceReport> {
    const res = await this.httpClient.put<MaintenanceReport>(
      `/maintenance/reports/${id}`,
      dto,
      { headers: this.getAuthHeaders() }
    );
    if (!res.ok || !res.data) throw new Error(res.error ?? 'Error al actualizar reporte');
    return res.data;
  }

  async deleteReport(id: number): Promise<void> {
    const res = await this.httpClient.delete(`/maintenance/reports/${id}`, { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error(res.error ?? 'Error al eliminar reporte');
  }

  // ── Export ──────────────────────────────────────────────────────────────────

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

  async exportExcel(): Promise<void> {
    // NOTE: Backend does not support /maintenance/export/excel
    // await this.downloadBlob('/maintenance/export/excel', `mantenimientos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    throw new Error('Exportación de mantenimiento no implementada en el servidor');
  }

  async exportPdf(): Promise<void> {
    // NOTE: Backend does not support /maintenance/export/pdf
    // await this.downloadBlob('/maintenance/export/pdf', `mantenimientos_${new Date().toISOString().slice(0, 10)}.pdf`);
    throw new Error('Exportación de mantenimiento no implementada en el servidor');
  }
}
