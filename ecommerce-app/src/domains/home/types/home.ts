// UI 컴포넌트 타입은 공통으로 이동되었습니다
import type { UIComponent } from '@/components/common/types/ui-components';

export type {
  UIComponent,
  UIComponentType,
  BaseUIComponent,
  BannerComponent,
  CategoriesComponent,
  FeaturedProductsComponent,
  NewArrivalsComponent,
  PromotionComponent,
  ReviewsComponent,
  BrandsComponent,
} from '@/components/common/types/ui-components';

// API 응답 타입
export interface HomePageResponse {
  components: UIComponent[];
}

// Server Action 결과 타입
export interface HomePageResult {
  success: boolean;
  data?: HomePageResponse;
  error?: string;
  statusCode?: number;
}
