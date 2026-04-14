export interface OrderItem {
  id: number;
  fk_id_vent: number;
  cod_prod: number;
  cantidad: number;
  precio_unit: number;
}

export interface Order {
  id_vent: number;
  precio_prod_final: number;
  montofinal_vent: number;
  metodopago_usu?: string;
  fk_id_usu?: number;
  fecha_vent: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  items?: OrderItem[]; // from join
}

export interface Invoice {
  id: number;
  fk_id_vent: number;
  id_usu?: number;
  cantidad_vent: number;
  precio_prod: number;
  montototal_vent: number;
  emitida_en: string;
  // from join
  fecha_vent?: string;
  estado?: string;
  metodopago_usu?: string;
}

export interface CreateOrderDto {
  metodopago_usu: string;
  id_usu?: number;
  items: Array<{
    cod_prod: number;
    cantidad: number;
    precio_unit: number;
  }>;
}
