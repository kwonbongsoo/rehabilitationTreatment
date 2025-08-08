'use client';

import ProductFilters from '@/components/common/ProductFilters';
import { useCategoryContext } from '@/domains/category/context/CategoryContext';
import { ReactElement } from 'react';

interface ProductFiltersRendererProps {
  filterOptions: {
    value: string;
    label: string;
  }[];
  sortOptions: {
    value: string;
    label: string;
  }[];
}

export default function ProductFiltersRenderer({
  filterOptions,
  sortOptions,
}: ProductFiltersRendererProps): ReactElement {
  const {
    currentFilter,
    currentSort,
    viewMode,
    handleFilterChange,
    handleSortChange,
    handleViewModeChange,
  } = useCategoryContext();

  return (
    <ProductFilters
      filterOptions={filterOptions}
      sortOptions={sortOptions}
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      onViewModeChange={handleViewModeChange}
      defaultFilter={currentFilter}
      defaultSort={currentSort}
      defaultViewMode={viewMode}
    />
  );
}
