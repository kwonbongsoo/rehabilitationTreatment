/**
 * 카테고리 관련 Mock 데이터
 */

export interface MockCategory {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
  isActive: boolean;
  order: number;
  link: string;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: 1,
    name: 'Clothing',
    slug: 'clothing',
    iconCode: '👕',
    isActive: true,
    order: 1,
    link: '/categories?category=1',
  },
  {
    id: 2,
    name: 'Shoes',
    slug: 'shoes',
    iconCode: '👞',
    isActive: true,
    order: 2,
    link: '/categories?category=2',
  },
  {
    id: 3,
    name: 'Accessories',
    slug: 'accessories',
    iconCode: '👜',
    isActive: true,
    order: 3,
    link: '/categories?category=3',
  },
  {
    id: 4,
    name: 'Electronics',
    slug: 'electronics',
    iconCode: '📱',
    isActive: true,
    order: 4,
    link: '/categories?category=4',
  },
  {
    id: 5,
    name: 'Home & Garden',
    slug: 'home-garden',
    iconCode: '🏠',
    isActive: true,
    order: 5,
    link: '/categories?category=5',
  },
];

// 카테고리 유틸리티 함수들
export const getCategoryById = (id: number): MockCategory | undefined => {
  const findCategory = (categories: MockCategory[]): MockCategory | undefined => {
    for (const category of categories) {
      if (category.id === id) {
        return category;
      }
    }
    return undefined;
  };

  return findCategory(MOCK_CATEGORIES);
};

export const getCategoryBySlug = (slug: string): MockCategory | undefined => {
  const findCategory = (categories: MockCategory[]): MockCategory | undefined => {
    for (const category of categories) {
      if (category.slug === slug) {
        return category;
      }
    }
    return undefined;
  };

  return findCategory(MOCK_CATEGORIES);
};

export const getTopLevelCategories = (): MockCategory[] => {
  return MOCK_CATEGORIES.filter((category) => category.id === 0);
};

export const getFlatCategories = (): MockCategory[] => {
  const flatten = (categories: MockCategory[]): MockCategory[] => {
    const result: MockCategory[] = [];

    for (const category of categories) {
      result.push(category);
    }

    return result;
  };

  return flatten(MOCK_CATEGORIES);
};
