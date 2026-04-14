export interface Supplier {
  cod_prov: number;
  id_prov?: string;
  nom_prov: string;
  tel_prov?: string;
  tipoid_prov?: string;
}

export interface Movement {
  id_mov: number;
  tipo_mov: 'entrada' | 'salida' | 'ajuste';
  fecha_mov: string;
  cantidad: number;
  cod_prod: number;
  fk_cod_prov?: number;
  fk_id_vent?: number;
}

export interface Suministra {
  id: number;
  fk_cod_prov: number;
  cod_prod: number;
  stock: number;
  stock_minimo: number;
  nom_prov?: string; // from join
}

export interface CreateSupplierDto extends Omit<Supplier, 'cod_prov'> {}
export interface CreateMovementDto extends Omit<Movement, 'id_mov'> {}
export interface UpsertSuministraDto extends Omit<Suministra, 'id' | 'nom_prov'> {}
