export interface MaintenanceReport {
  id?: number;
  titulo?: string;
  descripcion?: string;
  estado?: 'pendiente' | 'en_progreso' | 'completado';
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  responsable?: string;
}
