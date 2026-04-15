export interface Category {
  id_cat?: number;
  nom_cat: string;
  desc_cat?: string;
}

export interface Product {
  cod_prod?: number;
  nom_prod: string;
  desc_prod?: string;
  precio_prod: number;
  stock_actual?: number;
  stock_minimo?: number;
  imagen_prod?: string;
  fk_id_cat?: number;
  categoria?: Category;
  alerta_stock_critico?: boolean;
}
