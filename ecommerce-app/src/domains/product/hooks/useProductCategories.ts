import { useState, useEffect } from 'react';
import { fetchCategories } from '@/domains/category/services/categoriesService';
import { Category } from '@/types';

interface UseProductCategoriesReturn {
  categories: Category[];
  loadingCategories: boolean;
  categoriesError: string | null;
}

export function useProductCategories(): UseProductCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      try {
        setLoadingCategories(true);
        setCategoriesError(null);

        const response = await fetchCategories();

        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          const errorMessage = response.error || 'Failed to load categories';
          console.error('Failed to fetch categories:', errorMessage);
          setCategoriesError(errorMessage);
        }
      } catch (error) {
        const errorMessage = 'Failed to load categories';
        console.error('Error loading categories:', error);
        setCategoriesError(errorMessage);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  return {
    categories,
    loadingCategories,
    categoriesError,
  };
}
