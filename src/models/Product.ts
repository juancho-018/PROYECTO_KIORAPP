export interface Product {
  cod_prod: number;
  nom_prod: string;
  descrip_prod: string | null;
  precio_unitario: number;
  fechaven_prod: string | null;
  fk_cod_cat: number | null;
  stock_actual: number; // <-- ADDED
  stock_minimo: number; // <-- ADDED
  url_imagen: string | null; // <-- NEW: Imagen del producto
  nom_cat?: string; // Joined field
  descrip_cat?: string; // Joined field
}

export interface Category {
  cod_cat: number;
  nom_cat: string;
  descrip_cat: string | null;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
