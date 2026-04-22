export interface Incident {
  id_rep: number;
  titulo: string | null;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  fecha_rep: string;
  fk_id_usu: number;
  cod_prod?: number | null;
  observaciones_tecnicas?: string | null;
}

export interface CreateIncidentDto {
  titulo: string;
  descripcion: string;
  prioridad?: 'baja' | 'media' | 'alta';
  fk_id_usu: number;
  cod_prod?: number;
}
