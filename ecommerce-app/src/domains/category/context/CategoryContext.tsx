'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface CategoryContextType {
  selectedCategoryId: number;
  currentFilter: string;
  currentSort: string;
  viewMode: 'grid' | 'list';

  // Actions
  handleCategoryClick: (categoryId: number) => void;
  handleFilterChange: (filter: string) => void;
  handleSortChange: (sort: string) => void;
  handleViewModeChange: (mode: 'grid' | 'list') => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export { CategoryContext };

interface CategoryProviderProps {
  children: ReactNode;
  initialCategoryFilter?: string;
}

export function CategoryProvider({ children, initialCategoryFilter }: CategoryProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 기반 상태 초기화
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(() => {
    return parseInt(initialCategoryFilter || searchParams.get('category') || '0');
  });

  const [currentFilter, setCurrentFilter] = useState(() => {
    return searchParams.get('filter') || '전체';
  });

  const [currentSort, setCurrentSort] = useState(() => {
    return searchParams.get('sort') || 'popular';
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (searchParams.get('view') as 'grid' | 'list') || 'grid';
  });

  // URL 업데이트 헬퍼
  const updateURL = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== '0' && value !== '전체' && value !== 'popular' && value !== 'grid') {
          current.set(key, value);
        } else {
          current.delete(key);
        }
      });

      const queryString = current.toString();
      const newURL = `/categories${queryString ? `?${queryString}` : ''}`;

      router.push(newURL, { scroll: false });
    },
    [router, searchParams],
  );

  // 이벤트 핸들러들 - URL 업데이트 제거하고 클라이언트 상태만 관리
  const handleCategoryClick = useCallback(
    (categoryId: number) => {
      setSelectedCategoryId(categoryId);
    },
    [],
  );

  const handleFilterChange = useCallback(
    (filter: string) => {
      setCurrentFilter(filter);
    },
    [],
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      setCurrentSort(sort);
    },
    [],
  );

  const handleViewModeChange = useCallback(
    (mode: 'grid' | 'list') => {
      setViewMode(mode);
    },
    [],
  );

  const value: CategoryContextType = {
    selectedCategoryId,
    currentFilter,
    currentSort,
    viewMode,
    handleCategoryClick,
    handleFilterChange,
    handleSortChange,
    handleViewModeChange,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
}
