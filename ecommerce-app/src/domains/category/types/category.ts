export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  productCount: number;
}

export interface CategoryFilter {
  parentId?: string;
  includeChildren?: boolean;
  sortBy?: 'name' | 'productCount';
  order?: 'asc' | 'desc';
}
