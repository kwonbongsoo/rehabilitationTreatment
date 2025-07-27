'use client';

import { useState } from 'react';
import styles from './ProductFilters.module.css';

interface FilterOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface ProductFiltersProps {
  filterOptions?: FilterOption[];
  sortOptions?: SortOption[];
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onViewModeChange?: (viewMode: 'grid' | 'list') => void;
  defaultFilter?: string;
  defaultSort?: string;
  defaultViewMode?: 'grid' | 'list';
}

const DEFAULT_FILTER_OPTIONS: FilterOption[] = [
  { value: '전체', label: '전체' },
  { value: '할인상품', label: '할인상품' },
  { value: '신상품', label: '신상품' },
  { value: '입고상품', label: '입고상품' }
];

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '최신순' },
  { value: 'price-low', label: '가격 낮은순' },
  { value: 'price-high', label: '가격 높은순' }
];

export default function ProductFilters({
  filterOptions = DEFAULT_FILTER_OPTIONS,
  sortOptions = DEFAULT_SORT_OPTIONS,
  onFilterChange,
  onSortChange,
  onViewModeChange,
  defaultFilter = '전체',
  defaultSort = 'popular',
  defaultViewMode = 'grid'
}: ProductFiltersProps) {
  const [filterBy, setFilterBy] = useState(defaultFilter);
  const [sortBy, setSortBy] = useState(defaultSort);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultViewMode);

  const handleFilterChange = (filter: string) => {
    setFilterBy(filter);
    onFilterChange?.(filter);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    onSortChange?.(sort);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        {/* 첫 번째 행: 필터 버튼들과 뷰 토글 */}
        <div className={styles.filtersRow}>
          <div className={styles.filters}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles.filterButton} ${filterBy === option.value ? styles.active : ''}`}
                onClick={() => handleFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('grid')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => handleViewModeChange('list')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        {/* 두 번째 행: 정렬 선택 */}
        <div className={styles.sortAndView}>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}