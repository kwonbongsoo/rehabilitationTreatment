import { create } from 'zustand';
import { Category, CategoryFilter, CategoryListItem } from '../types/category';

interface CategoryState {
  categories: CategoryListItem[];
  selectedCategory: Category | null;
  filter: CategoryFilter;
  loading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: CategoryListItem[]) => void;
  setSelectedCategory: (category: Category | null) => void;
  setFilter: (filter: CategoryFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getFilteredCategories: () => CategoryListItem[];
  getCategoryBySlug: (slug: string) => CategoryListItem | undefined;
  getCategoryById: (id: string) => CategoryListItem | undefined;
}

export const useCategoryStore = create<CategoryState>()((set, get) => ({
  categories: [],
  selectedCategory: null,
  filter: {},
  loading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setFilter: (filter) => set({ filter }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getFilteredCategories: () => {
    const { categories, filter } = get();
    let filtered = [...categories];

    if (filter.parentId) {
      filtered = filtered.filter((category) => category.parentId === filter.parentId);
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const order = filter.order === 'desc' ? -1 : 1;
        switch (filter.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name) * order;
          case 'productCount':
            return (a.productCount - b.productCount) * order;
          default:
            return 0;
        }
      });
    }

    return filtered;
  },

  getCategoryBySlug: (slug) => {
    return get().categories.find((category) => category.slug === slug);
  },

  getCategoryById: (id) => {
    return get().categories.find((category) => category.id === id);
  },
}));
