import type { Product } from '@/domains/product/types/product';

export const MOCK_PRODUCT_IMAGES = {
  DEFAULT: 'https://static.kbs-cdn.shop/image/promotion.jpg',
  PLACEHOLDER: '/images/placeholder-product.jpg',
  SAMPLES: [
    'https://static.kbs-cdn.shop/image/promotion.jpg',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1505740420928-5e1bd6c4c4b6',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
  ] as const,
} as const;

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Classic T-shirt',
    price: 169000,
    originalPrice: 199000,
    mainImage: MOCK_PRODUCT_IMAGES.DEFAULT,
    images: [
      MOCK_PRODUCT_IMAGES.DEFAULT,
      MOCK_PRODUCT_IMAGES.SAMPLES[1],
      MOCK_PRODUCT_IMAGES.SAMPLES[2],
    ],
    description: 'Comfortable cotton classic t-shirt perfect for everyday wear.',
    categoryId: 1,
    rating: 4.5,
    reviews: 128,
    discount: 15,
    stock: 50,
    tags: [
      { name: 'cotton', color: '#047857' },
      { name: 'casual', color: '#007bff' },
      { name: 'basic', color: '#dc2626' },
    ],
    sellerId: 'star12310',
    isNew: false,
    isFeatured: false,
  },
  {
    id: 2,
    name: 'Skinny Jeans',
    price: 189000,
    originalPrice: 239000,
    mainImage: MOCK_PRODUCT_IMAGES.SAMPLES[1],
    images: [
      MOCK_PRODUCT_IMAGES.SAMPLES[1],
      MOCK_PRODUCT_IMAGES.SAMPLES[2],
      MOCK_PRODUCT_IMAGES.DEFAULT,
    ],
    description: 'Stylish skinny jeans with perfect fit and comfort.',
    categoryId: 1,
    rating: 4.3,
    reviews: 89,
    discount: 21,
    stock: 30,
    tags: [
      { name: 'denim', color: '#047857' },
      { name: 'skinny', color: '#007bff' },
      { name: 'fashion', color: '#dc2626' },
    ],
    sellerId: 'star12310',
    isNew: false,
    isFeatured: false,
  },
  {
    id: 3,
    name: 'Slip Dresses',
    price: 159000,
    mainImage: MOCK_PRODUCT_IMAGES.SAMPLES[2],
    images: [
      MOCK_PRODUCT_IMAGES.SAMPLES[2],
      MOCK_PRODUCT_IMAGES.DEFAULT,
      MOCK_PRODUCT_IMAGES.SAMPLES[1],
    ],
    description: 'Elegant slip dress for special occasions.',
    categoryId: 1,
    rating: 4.7,
    reviews: 156,
    stock: 25,
    tags: [
      { name: 'dress', color: '#047857' },
      { name: 'elegant', color: '#007bff' },
      { name: 'occasion', color: '#dc2626' },
    ],
    sellerId: 'star12310',
    isNew: false,
    isFeatured: false,
  },
  {
    id: 4,
    name: 'Summer Collection T-shirt',
    price: 149000,
    mainImage: MOCK_PRODUCT_IMAGES.SAMPLES[3],
    images: [],
    description: 'Light and breezy summer t-shirt.',
    categoryId: 2,
    rating: 4.4,
    reviews: 67,
    stock: 40,
    tags: [
      { name: 'summer', color: '#047857' },
      { name: 'light', color: '#007bff' },
      { name: 'casual', color: '#dc2626' },
    ],
    sellerId: 'star12310',
    isNew: false,
    isFeatured: false,
  },
  {
    id: 5,
    name: 'Winter Coat',
    price: 399000,
    originalPrice: 499000,
    mainImage: MOCK_PRODUCT_IMAGES.DEFAULT,
    images: [],
    description: 'Warm and stylish winter coat.',
    categoryId: 3,
    rating: 4.8,
    reviews: 234,
    discount: 20,
    stock: 15,
    tags: [
      { name: 'winter', color: '#047857' },
      { name: 'warm', color: '#007bff' },
      { name: 'coat', color: '#dc2626' },
    ],
    sellerId: 'star12310',
    isNew: false,
    isFeatured: false,
  },
];

export const MOCK_PRODUCT_CATEGORIES = [
  { id: 'clothing', name: 'Clothing', count: 3 },
  { id: 'summer', name: 'Summer', count: 1 },
  { id: 'winter', name: 'Winter', count: 1 },
  { id: 'accessories', name: 'Accessories', count: 0 },
  { id: 'shoes', name: 'Shoes', count: 0 },
];

export const MOCK_PRODUCT_COLLECTIONS = {
  summer: MOCK_PRODUCTS.filter((p) => p.categoryId === 1),
  winter: MOCK_PRODUCTS.filter((p) => p.categoryId === 2),
  spring: [],
  fall: [],
  tags: MOCK_PRODUCTS.filter((p) => p.tags),
  seasonal: MOCK_PRODUCTS.filter((p) => [1, 2, 3].includes(p.categoryId)),
};

// 제품 유틸리티 함수들
export const getProductById = (id: number): Product | undefined => {
  return MOCK_PRODUCTS.find((product) => product.id === id);
};

export const getProductsByCategory = (categoryId: number): Product[] => {
  return MOCK_PRODUCTS.filter((product) => product.categoryId === categoryId);
};

export const getProductsByCollection = (
  collection: keyof typeof MOCK_PRODUCT_COLLECTIONS,
): Product[] => {
  return MOCK_PRODUCT_COLLECTIONS[collection] || [];
};

export const getFeaturedProducts = (limit = 4): Product[] => {
  return MOCK_PRODUCTS.slice(0, limit);
};

export const getNewProducts = (limit = 4): Product[] => {
  return MOCK_PRODUCTS.filter((p) => p.tags?.some((t) => t.name === 'NEW')).slice(0, limit);
};

export const getSaleProducts = (limit = 4): Product[] => {
  return MOCK_PRODUCTS.filter((p) => p.discount).slice(0, limit);
};
