export interface RawBannerData {
  id: number;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
}

export interface RawCategoryData {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
  order: number;
  isActive: boolean;
}

export interface RawProductData {
  id: number;
  name: string;
  price: number;
  discountPercentage: number;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
  category: string;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
  description: string;
}

export interface RawPromotionData {
  id: number;
  title: string;
  description: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
}

export interface RawReviewData {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  productName: string;
  createdAt: string;
}

export interface RawBrandData {
  id: number;
  name: string;
  logoUrl: string;
  isActive: boolean;
}
