export interface Product {
  cod_prod: number;
  nom_prod: string;
  descrip_prod?: string;
  precio_unitario: number;
  fechaven_prod?: string;
  fk_cod_cat?: number;
  stock_actual: number;
  stock_minimo: number;
  url_imagen?: string;
  nom_cat?: string; // from join
}

export interface CreateProductDto extends Omit<Product, 'cod_prod' | 'nom_cat'> {
  imagen?: File; // to handle multipart uploads if needed
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}
