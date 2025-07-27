import { readFile } from 'fs/promises';
import { join } from 'path';
import {
  CategoryRaw,
  ProductRaw,
  Product,
  CategoryWithProducts,
  CategoryPageData,
  CategoryDetailData,
  FilterOption,
} from '../types/categoryTypes';

interface LoadedData {
  categories: CategoryRaw[];
  products: ProductRaw[];
}

class CategoryService {
  private async loadJsonFiles(): Promise<LoadedData> {
    const categoriesPath = join(__dirname, '../data/categories.json');
    const productsPath = join(__dirname, '../data/categoriesProduct.json');

    const [categoriesData, productsData] = await Promise.all([
      readFile(categoriesPath, 'utf-8'),
      readFile(productsPath, 'utf-8'),
    ]);

    return {
      categories: JSON.parse(categoriesData) as CategoryRaw[],
      products: JSON.parse(productsData) as ProductRaw[],
    };
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
      { value: 'popularity', label: '인기순' },
      { value: 'price-low', label: '낮은 가격순' },
      { value: 'price-high', label: '높은 가격순' },
      { value: 'rating', label: '평점순' },
      { value: 'newest', label: '최신순' },
    ];
  }

  private groupProductsByCategory(
    categories: CategoryRaw[],
    products: ProductRaw[],
  ): CategoryWithProducts[] {
    return categories
      .filter((cat) => cat.isActive)
      .map((category) => {
        const categoryProducts = products.filter((product) => product.categoryId === category.id);

        return {
          ...category,
          products: categoryProducts,
        };
      });
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

  // 특정 카테고리 상세 페이지용
  async getCategoryDetailData(
    slug: string,
  ): Promise<{ success: boolean; data: CategoryDetailData }> {
    const { categories, products } = await this.loadJsonFiles();

    const category = categories.find((cat) => cat.slug === slug);
    if (!category) {
      throw new Error('Category not found');
    }

    const categoryProducts = products.filter((product) => product.categoryId === category.id);

    const categoryWithProducts: CategoryWithProducts = {
      ...category,
      products: categoryProducts,
    };

    const filters: FilterOption[] = this.getDefaultFilters();

    return {
      success: true,
      data: {
        category: categoryWithProducts,
        filters,
      },
    };
  }
}

export default new CategoryService();
