import { HttpClient } from '@ecommerce/common';
import { serviceEndpoints } from '../utils/config';
import { CreateProductRequest, ProductDomainCategory, ProductDomainProduct } from '../types';

interface ProductDomainProductResponse {
  products: ProductDomainProduct[];
  total: number;
  page: number;
  limit: number;
}

interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

class ProductDomainClient extends HttpClient {
  constructor() {
    super(serviceEndpoints.product.baseURL, {
      timeout: serviceEndpoints.product.timeout,
      headers: serviceEndpoints.product.headers,
    });
  }

  // Categories API
  async getCategories(): Promise<ProductDomainCategory[]> {
    return await this.get<ProductDomainCategory[]>('/categories');
  }

  async getCategoryById(id: number): Promise<ProductDomainCategory> {
    return await this.get<ProductDomainCategory>(`/categories/${id}`);
  }

  async getCategoryBySlug(slug: string): Promise<ProductDomainCategory> {
    return await this.get<ProductDomainCategory>(`/categories/slug/${slug}`);
  }

  async createCategory(data: Partial<ProductDomainCategory>): Promise<ProductDomainCategory> {
    return await this.post<ProductDomainCategory>('/categories', data);
  }

  async updateCategory(
    id: number,
    data: Partial<ProductDomainCategory>,
  ): Promise<ProductDomainCategory> {
    return await this.patch<ProductDomainCategory>(`/categories/${id}`, data);
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    return await this.delete<{ message: string }>(`/categories/${id}`);
  }

  // Products API
  async getProducts(params?: ProductQueryParams): Promise<ProductDomainProductResponse> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return await this.get<ProductDomainProductResponse>(endpoint);
  }

  async getProductById(id: number): Promise<ProductDomainProduct> {
    return await this.get<ProductDomainProduct>(`/products/${id}`);
  }

  async createProduct(productData: any): Promise<ProductDomainProduct> {
    // 이제 항상 JSON으로 전송 (이미지 URL 포함)
    return await this.post<ProductDomainProduct>('/products', productData);
  }

  /**
   * 이미지만 업로드 (상품 생성 전)
   */
  async uploadImagesOnly(files: File[]): Promise<{ message: string; imageUrls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return await this.requestMultiPartServer<{ message: string; imageUrls: string[] }>(
      '/products/images',
      formData,
      { method: 'POST' },
    );
  }

  async updateProduct(
    id: number,
    data: Partial<ProductDomainProduct>,
  ): Promise<ProductDomainProduct> {
    return await this.patch<ProductDomainProduct>(`/products/${id}`, data);
  }

  async deleteProduct(id: number): Promise<{ message: string }> {
    return await this.delete<{ message: string }>(`/products/${id}`);
  }

  // Product Images API
  async uploadProductImages(
    productId: number,
    files: File[],
  ): Promise<{ message: string; images: any[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return await this.requestMultiPartServer<{ message: string; images: any[] }>(
      `/products/${productId}/images`,
      formData,
      { method: 'POST' },
    );
  }

  async deleteProductImage(productId: number, imageId: number): Promise<{ message: string }> {
    return await this.delete<{ message: string }>(`/products/${productId}/images/${imageId}`);
  }

  async getProductsByCategory(categoryId: number): Promise<ProductDomainProduct[]> {
    const response = await this.getProducts({ categoryId });
    return response.products;
  }

  async searchProducts(searchTerm: string): Promise<ProductDomainProduct[]> {
    const response = await this.getProducts({ search: searchTerm });
    return response.products;
  }

  // Product Options API
  async createProductOptions(productId: number, options: any[]): Promise<any[]> {
    return await this.post<any[]>(`/products/${productId}/options`, { options });
  }

  async getProductOptions(productId: number): Promise<any[]> {
    return await this.get<any[]>(`/products/${productId}/options`);
  }

  async updateProductOption(productId: number, optionId: number, data: any): Promise<any> {
    return await this.patch<any>(`/products/${productId}/options/${optionId}`, data);
  }

  async deleteProductOption(optionId: number): Promise<{ message: string }> {
    return await this.delete<{ message: string }>(`/product-options/${optionId}`);
  }
}

// 싱글톤 인스턴스 생성
const productDomainClient = new ProductDomainClient();
export default productDomainClient;
