export interface SaleItem {
  id: number;
  fk_id_vent: number;
  cod_prod: number;
  cantidad: number;
  precio_unit: number;
  nom_prod?: string; // Optional joined field
}

export interface Order {
  id_vent: number;
  fecha_vent: string;
  precio_prod_final: number;
  montofinal_vent: number;
  metodopago_usu: string | null;
  estado: 'pendiente' | 'completada' | 'cancelada';
  items?: SaleItem[];
}

export interface Invoice {
  id_fact: number;
  fecha_fact: string;
  total_fact: number;
  id_pedido: number; 
  id_usu: number;
  cantidad_vent: number;
  precio_prod: number;
}

export interface PaginatedOrders {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
