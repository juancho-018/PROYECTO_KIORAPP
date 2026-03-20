export interface User {
  id?: string | number;
  id_usu?: string | number;
  nom_usu?: string;
  nombres_usu?: string;
  apellidos_usu?: string;
  correo_usu: string;
  tel_usu?: string;
  rol_usu?: string;
  estado_usu?: boolean;
  intentos_fallidos?: number;
  bloqueado_hasta?: string | Date | null;
  // Permitir la extensión controlada del objeto sin usar any
  [key: string]: unknown;
}
