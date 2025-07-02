import { create } from 'zustand';
import { Product, ProductFilter, ProductListItem } from '../types/product';

interface ProductState {
  products: ProductListItem[];
  selectedProduct: Product | null;
  filter: ProductFilter;
  loading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: ProductListItem[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilter: (filter: ProductFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getFilteredProducts: () => ProductListItem[];
  getProductById: (id: string) => ProductListItem | undefined;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  selectedProduct: null,
  filter: {},
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getFilteredProducts: () => {
    const { products, filter } = get();
    let filtered = [...products];

    if (filter.categoryId) {
      filtered = filtered.filter((product) => product.id === filter.categoryId);
    }

    if (filter.minPrice !== undefined) {
      filtered = filtered.filter((product) => product.price >= filter.minPrice!);
    }

    if (filter.maxPrice !== undefined) {
      filtered = filtered.filter((product) => product.price <= filter.maxPrice!);
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const order = filter.order === 'desc' ? -1 : 1;
        switch (filter.sortBy) {
          case 'price':
            return (a.price - b.price) * order;
          case 'rating':
            return (a.rating - b.rating) * order;
          case 'newest':
            return (new Date(a.id).getTime() - new Date(b.id).getTime()) * order;
          default:
            return 0;
        }
      });
    }

    return filtered;
  },

  getProductById: (id) => {
    return get().products.find((product) => product.id === id);
  },
}));
