export interface OrderItem {
  cod_prod: number;
  cantidad: number;
  precio_unit: number;
  nom_prod?: string;
  url_imagen?: string;
}

export interface Order {
  id_vent?: number;
  fecha_vent?: string;
  montofinal_vent?: number;
  metodopago_usu?: string;
  estado?: 'pendiente' | 'completada' | 'cancelada';
  items?: OrderItem[];
}

export interface Invoice {
  id_fac?: number;
  fk_id_vent?: number;
  id_usu?: number;
  cantidad_vent?: number;
  precio_prod?: number;
  montototal_vent?: number;
  fecha_fac?: string;
  venta?: Order;
}

export interface Paginated<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
