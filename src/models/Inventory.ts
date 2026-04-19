export interface Supplier {
  cod_prov?: number;
  nom_prov: string;
  tel_prov?: string;
  correo_prov?: string;
  dir_prov?: string;
}

export interface Movement {
  id_mov?: number;
  tipo_mov: 'entrada' | 'salida';
  cantidad_mov: number;
  fecha_mov?: string;
  desc_mov?: string;
  fk_cod_prod?: number;
  fk_cod_prov?: number;
  producto?: { nom_prod: string };
  proveedor?: { nom_prov: string };
}

export interface Suministra {
  id_sum?: number;
  fk_cod_prov: number;
  cod_prod: number;
  stock: number;
  stock_minimo: number;
  proveedor?: { nom_prov: string };
  producto?: { nom_prod: string };
  alerta_stock_minimo?: boolean;
}

export interface LowStockItem {
  cod_prod: number;
  nom_prod: string;
  stock_actual: number;
  stock_minimo: number;
}
  proveedor?: { nom_prov: string };
  producto?: { nom_prod: string };
  alerta_stock_minimo?: boolean;
}

export interface LowStockItem {
  cod_prod: number;
  nom_prod: string;
  stock_actual: number;
  stock_minimo: number;
}
