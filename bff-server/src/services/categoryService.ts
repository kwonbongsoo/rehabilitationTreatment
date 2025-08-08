import { ProductDomainCategory, ProductDomainProduct } from '../types';
import { CategoryWithProducts, CategoryPageData, FilterOption } from '../types/categoryTypes';
import productDomainClient from '../clients/productDomainClient';
import { TAGS_COLORS } from '../types/common';

class CategoryService {
  constructor() {
    // Product 도메인 클라이언트는 싱글톤으로 관리됨
  }

  // Product Domain API 호출 메서드들
  private async getCategoriesFromProductDomain(): Promise<ProductDomainCategory[]> {
    return await productDomainClient.getCategories();
  }

  private async getProductsFromProductDomain(): Promise<ProductDomainProduct[]> {
    const response = await productDomainClient.getProducts({ page: 1, limit: 20 });
    return response.products || [];
  }

  private getDefaultFilters(): FilterOption[] {
    return [
      { value: '전체', label: '전체' },
      { value: '할인상품', label: '할인상품' },
      { value: '신상품', label: '신상품' },
      { value: '인기상품', label: '인기상품' },
    ];
  }

  private getDefaultSortOptions(): FilterOption[] {
    return [
      { value: 'popular', label: '인기순' },
      { value: 'price-low', label: '낮은 가격순' },
      { value: 'price-high', label: '높은 가격순' },
      { value: 'rating', label: '평점순' },
      { value: 'newest', label: '최신순' },
    ];
  }

  private groupProductsByCategory(
    domainCategories: ProductDomainCategory[],
    domainProducts: ProductDomainProduct[],
  ): CategoryWithProducts[] {
    const categoriesWithProducts = domainCategories
      .filter((cat) => cat.isActive)
      .map((category) => {
        const categoryProducts = domainProducts.filter(
          (product) => product.categoryId === category.id,
        );

        return {
          link: `/categories?category=${encodeURIComponent(category.id)}`,
          id: category.id,
          name: category.name,
          slug: category.slug,
          iconCode: category.iconCode || '📦',
          order: category.order || 0,
          isActive: category.isActive,
          products: categoryProducts.map((item) => {
            return {
              id: item.id,
              name: item.name,
              price: item.price,
              mainImage: item.mainImage,
              rating: item.averageRating,
              reviewCount: item.reviewCount,
              description: item.description,
              categoryId: item.categoryId,
              // isNew 상태도 포함
              isNew: item.isNew,
              // 할인이 있을 때만 discount 속성 추가
              ...(item.discountPercentage > 0 && {
                discount: item.discountPercentage,
                originalPrice: item.originalPrice,
              }),
            };
          }),
        };
      })
      .filter((category) => category.products.length > 0);

    // "전체" 카테고리를 맨 앞에 추가
    return [
      {
        id: 0,
        name: '전체',
        slug: '',
        iconCode: '👕',
        isActive: true,
        link: '/categories',
        products: [],
      },
      ...categoriesWithProducts,
    ];
  }

  // See All 페이지용 - 컴포넌트 기반 구조로 반환
  async getCategoryPageData(): Promise<{ success: boolean; data: CategoryPageData }> {
    // Product domain에서 데이터 가져오기
    const [domainCategories, domainProducts] = await Promise.all([
      this.getCategoriesFromProductDomain(),
      this.getProductsFromProductDomain(),
    ]);

    const categoriesWithProducts = this.groupProductsByCategory(domainCategories, domainProducts);
    const filters = this.getDefaultFilters();
    const sortOptions = this.getDefaultSortOptions();

    // 컴포넌트 배열 구성
    const components = [
      {
        id: 'category-grid',
        type: 'categoryGrid' as const,
        visible: true,
        data: {
          categories: categoriesWithProducts,
        },
      },
      {
        id: 'product-filters',
        type: 'productFilters' as const,
        visible: true,
        data: {
          filterOptions: filters,
          sortOptions: sortOptions,
        },
      },
      {
        id: 'product-grid',
        type: 'productGrid' as const,
        visible: true,
        data: {
          allProducts: domainProducts.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            mainImage: item.mainImage,
            rating: item.averageRating,
            reviewCount: item.reviewCount,
            isNew: item.isNew,
            categoryId: item.categoryId,
            tags: [
              ...(item.isNew ? [{ name: 'NEW', color: TAGS_COLORS.NEW }] : []),
              ...(item.isFeatured ? [{ name: '추천', color: TAGS_COLORS.RECOMMENDED }] : []),
              ...(item.discountPercentage > 0
                ? [{ name: '할인', color: TAGS_COLORS.DISCOUNT }]
                : []),
            ].filter(Boolean),
            // 할인이 있을 때만 discount 속성 추가
            ...(item.discountPercentage > 0 && {
              discount: item.discountPercentage,
              originalPrice: Math.round(item.price / (1 - item.discountPercentage / 100)),
            }),
          })),
        },
      },
    ];

    return {
      success: true,
      data: {
        components,
      },
    };
  }
}

const categoryService = new CategoryService();
export default categoryService;
