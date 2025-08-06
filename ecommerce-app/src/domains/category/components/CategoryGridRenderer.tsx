'use client';

import CategoryIconGrid from '@/components/common/CategoryIconGrid';
import { useCategoryContext } from '@/domains/category/context/CategoryContext';
import { CategoryGridRendererProps } from '@/domains/category/types/categories';
import { ReactElement } from 'react';

export default function CategoryGridRenderer({
  categories,
}: CategoryGridRendererProps): ReactElement {
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
