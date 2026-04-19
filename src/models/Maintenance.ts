export interface MaintenanceReport {
  id_rep?: number;
  descripcion?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  estado?: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  fk_id_usu?: string | number;
  cod_prod?: number | null;
  fecha_rep?: string;
  observaciones_tecnicas?: string; // Usado para el Título
}
