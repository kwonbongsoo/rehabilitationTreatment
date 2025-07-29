import { readFile } from 'fs/promises';
import { join } from 'path';
import { RawProductData } from '../types/common';
import {
  CategoryRaw,
  ProductRaw,
  CategoryWithProducts,
  CategoryPageData,
  FilterOption,
} from '../types/categoryTypes';

interface LoadedData {
  categories: CategoryRaw[];
  products: RawProductData[];
}

class CategoryService {
  private async loadJsonFiles(): Promise<LoadedData> {
    const categoriesPath = join(__dirname, '../data/categories.json');
    const productsPath = join(__dirname, '../data/products.json');

    const [categoriesData, productsData] = await Promise.all([
      readFile(categoriesPath, 'utf-8').catch((err) => {
        throw new Error(`Failed to load categories.json: ${err.message}`);
      }),
      readFile(productsPath, 'utf-8').catch((err) => {
        throw new Error(`Failed to load products.json: ${err.message}`);
      }),
    ]);

    try {
      return {
        categories: JSON.parse(categoriesData) as CategoryRaw[],
        products: JSON.parse(productsData) as ProductRaw[],
      };
    } catch (err) {
      throw new Error(
        `Failed to parse JSON data: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
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
    categories: CategoryRaw[],
    products: RawProductData[],
  ): CategoryWithProducts[] {
    return categories
      .filter((cat) => cat.isActive)
      .map((category) => {
        const categoryProducts = products.filter((product) => product.categoryId === category.id);

        return {
          ...category,
          products: categoryProducts.map((item) => {
            return {
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
            };
          }),
        };
      })
      .filter((category) => category.products.length > 0);
  }

  // See All 페이지용 - 모든 카테고리와 상품 데이터
  async getCategoryPageData(): Promise<{ success: boolean; data: CategoryPageData }> {
    const { categories, products } = await this.loadJsonFiles();

    const categoriesWithProducts = this.groupProductsByCategory(categories, products);
    const allProducts = products;
    const filters = this.getDefaultFilters();
    const sortOptions = this.getDefaultSortOptions();
    const totalProducts = products.length;

    return {
      success: true,
      data: {
        categories: categoriesWithProducts,
        allProducts,
        filters,
        sortOptions,
        totalProducts,
      },
    };
  }
}

export default new CategoryService();
