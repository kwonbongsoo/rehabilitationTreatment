'use client';

import CategoryIconGrid from '@/components/common/CategoryIconGrid';
import { useCategoryContext } from '@/domains/category/context/CategoryContext';

interface CategoryGridRendererProps {
  categories: {
    id: number;
    name: string;
    slug: string;
    iconCode: string;
    order: number;
    isActive: boolean;
    products: any[];
  }[];
}

export default function CategoryGridRenderer({ categories }: CategoryGridRendererProps) {
  const { selectedCategoryId, handleCategoryClick } = useCategoryContext();

  return (
    <CategoryIconGrid
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onCategoryClick={handleCategoryClick}
      disableNavigation={true}
    />
  );
}
