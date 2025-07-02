import { create } from 'zustand';
import { Product, ProductFilter, ProductListItem } from '../types/product';

// Mock products data
const mockProducts: ProductListItem[] = [
  {
    id: 1,
    name: '스타일리시 원피스',
    price: 89900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.5,
    category: 'dress',
    size: 'M',
    color: '블랙',
  },
  {
    id: 2,
    name: '클래식 셔츠',
    price: 59900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.3,
    category: 'top',
    size: 'L',
    color: '블루',
  },
  {
    id: 3,
    name: '캐주얼 스니커즈',
    price: 129900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.7,
    category: 'shoes',
    size: '250',
    color: '블랙',
  },
  {
    id: 4,
    name: '레더 핸드백',
    price: 199900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.6,
    category: 'bag',
    size: 'L',
    color: '블루',
  },
  {
    id: 5,
    name: '무선 이어폰',
    price: 79900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.4,
    category: 'accessories',
    size: 'M',
    color: '블랙',
  },
  {
    id: 6,
    name: '스포츠 티셔츠',
    price: 39900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.2,
    category: 'top',
    size: 'M',
    color: '블랙',
  },
  {
    id: 7,
    name: '미니멀 백팩',
    price: 149900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.8,
    category: 'bag',
    size: 'L',
    color: '블루',
  },
  {
    id: 8,
    name: '데님 자켓',
    price: 89900,
    image:
      'https://image.mustit.co.kr/lib/upload/admin/specialSale/6c646f20abbdb77a7d90bd4fd7c4a5d1.jpg',
    rating: 4.5,
    category: 'jacket',
    size: 'M',
    color: '블랙',
  },
];

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
  getProductById: (id: number) => ProductListItem | undefined;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  // Initialize with mock data
  products: mockProducts,
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
