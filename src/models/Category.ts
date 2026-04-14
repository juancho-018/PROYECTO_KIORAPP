export interface Category {
  cod_cat: number;
  nom_cat: string;
  descrip_cat?: string;
}

export interface CreateCategoryDto extends Omit<Category, 'cod_cat'> {}
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}
