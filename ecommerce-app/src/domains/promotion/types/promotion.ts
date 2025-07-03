export type PromotionType = 'discount' | 'freeShipping' | 'buyOneGetOne' | 'bundle';

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  startDate: string;
  endDate: string;
  discountRate?: number;
  discountAmount?: number;
  minimumPurchase?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  image?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionListItem {
  id: string;
  name: string;
  type: PromotionType;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface PromotionFilter {
  type?: PromotionType;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: 'startDate' | 'endDate' | 'name';
  order?: 'asc' | 'desc';
}
