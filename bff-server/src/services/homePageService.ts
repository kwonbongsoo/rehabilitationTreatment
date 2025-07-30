import * as fs from 'fs';
import * as path from 'path';
import { BaseError, ErrorCode } from '@ecommerce/common';
import { RawProductData } from '../types/common';
import {
  RawBannerData,
  RawCategoryData,
  RawPromotionData,
  RawReviewData,
  RawBrandData,
} from '../types/homePageTypes';

class HomePageService {
  private readonly dataPath: string;

  constructor() {
    // Docker 환경: /app/bff-server/dist/services -> /app/bff-server/dist/data
    // 로컬 환경: /app/bff-server/src/services -> /app/bff-server/src/data
    const defaultPath = path.join(__dirname, '../data');

    // 파일 존재 여부 확인
    if (fs.existsSync(defaultPath) && fs.existsSync(path.join(defaultPath, 'products.json'))) {
      this.dataPath = defaultPath;
    } else {
      // 대안 경로들 시도
      const fallbackPaths = [
        path.join(process.cwd(), 'dist/data'),
        path.join(process.cwd(), 'src/data'),
        path.join(__dirname, '../../src/data'),
      ];

      this.dataPath =
        fallbackPaths.find(
          (p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'products.json')),
        ) || defaultPath;
    }

    console.log(`🔍 Data path resolved to: ${this.dataPath}`);
    console.log(`📁 __dirname: ${__dirname}`);
    console.log(`📁 process.cwd(): ${process.cwd()}`);
    console.log(
      `✅ products.json exists: ${fs.existsSync(path.join(this.dataPath, 'products.json'))}`,
    );
  }

  // JSON 파일 읽기 헬퍼 메서드
  private readJsonFile<T>(fileName: string): T {
    try {
      const filePath = path.join(this.dataPath, fileName);
      console.log(`Attempting to read file: ${filePath}`); // 디버깅용 로그 추가
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error(`Error reading file ${fileName} from ${this.dataPath}:`, error); // 디버깅용 로그 추가
      throw new BaseError(
        ErrorCode.FILE_READ_ERROR,
        `Failed to read ${fileName}`,
        { context: error instanceof Error ? error.message : 'Unknown error' },
        500,
      );
    }
  }

  // 각 데이터 타입별 JSON 파일 조회 메서드
  private getRawBannerData(): RawBannerData[] {
    return this.readJsonFile<RawBannerData[]>('banners.json');
  }

  private getRawCategoryData(): RawCategoryData[] {
    return this.readJsonFile<RawCategoryData[]>('categories.json');
  }

  private getRawProductData(): RawProductData[] {
    return this.readJsonFile<RawProductData[]>('products.json');
  }

  private getRawPromotionData(): RawPromotionData[] {
    return this.readJsonFile<RawPromotionData[]>('promotions.json');
  }

  private getRawReviewData(): RawReviewData[] {
    return this.readJsonFile<RawReviewData[]>('reviews.json');
  }

  // 가라 데이터를 UI용 데이터로 변환하는 메서드들
  private transformBannerData(rawData: RawBannerData[]) {
    return {
      id: 'banner-1',
      type: 'banner',
      visible: true,
      data: {
        slides: rawData
          .filter((item) => item.isActive)
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            id: item.id,
            src: item.imageUrl,
            alt: item.altText,
            link: item.linkUrl,
            title: item.title,
            description: item.description,
            backgroundColor: item.backgroundColor,
          })),
      },
    };
  }

  private transformCategoryData(rawData: RawCategoryData[], rawProducts: RawProductData[]) {
    const activeCategories = rawData
      .filter((item) => item.isActive)
      .filter((item) => rawProducts.some((product) => product.categoryId === item.id))
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        ...item,
        link: `/categories?category=${encodeURIComponent(item.id)}`,
      }));

    return {
      id: 'categories-1',
      type: 'categories',
      title: '카테고리',
      visible: true,
      data: {
        categories: [
          // "전체" 카테고리를 맨 앞에 추가
          {
            id: 0,
            name: '전체',
            slug: 'all',
            iconCode: '👕',
            order: 0,
            isActive: true,
            products: [],
            link: '/categories',
          },
          ...activeCategories,
        ],
      },
    };
  }

  private transformProductData(rawData: RawProductData[], id: string, type: string, title: string) {
    // 상품 타입에 따라 다른 필터링 로직 적용
    let filteredProducts: RawProductData[];

    switch (type) {
      case 'featuredProducts':
        // 추천 상품: isFeatured가 true인 상품들
        filteredProducts = rawData.filter((item) => item.isFeatured);
        break;
      case 'newArrivals':
        // 신상품: isNew가 true인 상품들
        filteredProducts = rawData.filter((item) => item.isNew);
        break;
      default:
        // 기본값: 모든 상품
        filteredProducts = rawData;
        break;
    }

    return {
      id,
      type,
      title,
      visible: true,
      data: {
        products: filteredProducts.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.imageUrl,
          rating: item.averageRating,
          reviewCount: item.reviewCount,
          description: item.description,
          // isNew 상태도 포함
          isNew: item.isNew,
          // 할인이 있을 때만 discount 속성 추가
          ...(item.discountPercentage > 0 && {
            discount: item.discountPercentage,
            originalPrice: Math.round(item.price / (1 - item.discountPercentage / 100)),
          }),
        })),
      },
    };
  }

  private transformPromotionData(rawData: RawPromotionData[]) {
    const activePromotion = rawData.find((item) => item.isActive);
    if (!activePromotion) return null;

    return {
      id: 'promotion-1',
      type: 'promotion',
      visible: true,
      data: {
        title: activePromotion.title,
        description: activePromotion.description,
        link: activePromotion.linkUrl,
        buttonText: activePromotion.buttonText,
      },
    };
  }

  private transformReviewData(rawData: RawReviewData[]) {
    return {
      id: 'reviews-1',
      type: 'reviews',
      title: '고객 후기',
      visible: true,
      data: {
        reviews: rawData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((item) => {
            const nameWords = item.customerName.split('');
            const initials =
              nameWords.length >= 2 ? nameWords[0] + nameWords[1] : nameWords[0] + 'K';

            return {
              id: item.id,
              name: item.customerName,
              initials,
              rating: item.rating,
              text: item.comment,
              product: item.productName,
            };
          }),
      },
    };
  }

  // 메인 메서드: 모든 데이터를 변환하여 홈페이지 데이터 반환
  public async getHomePageData() {
    try {
      const [rawBanners, rawCategories, rawProducts, rawPromotions, rawReviews] = await Promise.all(
        [
          this.getRawBannerData(),
          this.getRawCategoryData(),
          this.getRawProductData(),
          this.getRawPromotionData(),
          this.getRawReviewData(),
        ],
      );

      const components = [];

      // 배너 컴포넌트
      const bannerComponent = this.transformBannerData(rawBanners);
      if (bannerComponent.data.slides.length > 0) {
        components.push(bannerComponent);
      }

      // 카테고리 컴포넌트
      const categoryComponent = this.transformCategoryData(rawCategories, rawProducts);
      if (categoryComponent.data.categories.length > 0) {
        components.push(categoryComponent);
      }

      // 추천 상품 컴포넌트
      const featuredProductComponent = this.transformProductData(
        rawProducts,
        'featuredProducts-1',
        'featuredProducts',
        '추천 상품',
      );

      if (featuredProductComponent.data.products.length > 0) {
        components.push(featuredProductComponent);
      }

      // 프로모션 컴포넌트
      const promotionComponent = this.transformPromotionData(rawPromotions);
      if (promotionComponent) {
        components.push(promotionComponent);
      }

      // 신상품 컴포넌트
      const newArrivalsComponent = this.transformProductData(
        rawProducts,
        'newArrivals-1',
        'newArrivals',
        '신상품',
      );

      if (newArrivalsComponent.data.products.length > 0) {
        components.push(newArrivalsComponent);
      }

      // 리뷰 컴포넌트
      const reviewComponent = this.transformReviewData(rawReviews);
      if (reviewComponent.data.reviews.length > 0) {
        components.push(reviewComponent);
      }

      return {
        components,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to generate home page data',
        { context: error instanceof Error ? error.message : 'Unknown error' },
        500,
      );
    }
  }
}

export default new HomePageService();
