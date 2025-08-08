export interface RawBannerData {
  id: number;
  imageUrl: string;
  altText: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  title: string;
  description: string;
  backgroundColor: string;
}

export interface RawCategoryData {
  id: number;
  name: string;
  slug: string;
  iconCode: string;
  order: number;
  isActive: boolean;
}

export { Product } from './common';

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
