import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Product } from '@entities/index';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataInitializerService {
  private readonly logger = new Logger(DataInitializerService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async initializeData(): Promise<void> {
    try {
      this.logger.log('데이터 초기화를 시작합니다...');

      // 테이블 존재 여부 확인 (재시도 로직 포함)
      let retries = 5;
      while (retries > 0) {
        try {
          await this.categoryRepository.query(
            'SELECT 1 FROM categories LIMIT 1',
          );
          break; // 테이블이 존재하면 루프 종료
        } catch (error) {
          retries--;
          if (retries === 0) {
            this.logger.error(
              '테이블이 생성되지 않았습니다. synchronize 설정을 확인하세요.',
            );
            throw new Error('Database tables not found');
          }
          this.logger.log(`테이블 생성 대기 중... (${retries}회 재시도 남음)`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
        }
      }

      // 기존 데이터 확인
      const categoryCount = await this.categoryRepository.count();
      const productCount = await this.productRepository.count();

      if (categoryCount > 0 || productCount > 0) {
        this.logger.log(
          `기존 데이터가 존재합니다. (카테고리: ${categoryCount}, 상품: ${productCount})`,
        );
        return;
      }

      // 카테고리 데이터 초기화
      await this.initializeCategories();

      // 상품 데이터 초기화
      await this.initializeProducts();

      this.logger.log('데이터 초기화가 완료되었습니다.');
    } catch (error) {
      this.logger.error('데이터 초기화 중 오류가 발생했습니다:', error);
      throw error;
    }
  }

  private async initializeCategories(): Promise<void> {
    try {
      // BFF 서버에서 카테고리 데이터 가져오기
      const categoriesPath = path.join(
        __dirname,
        '..',
        'data',
        'categories.json',
      );
      const categoriesData = JSON.parse(
        fs.readFileSync(categoriesPath, 'utf8'),
      );

      for (const categoryData of categoriesData) {
        const category = this.categoryRepository.create({
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          iconCode: categoryData.iconCode,
          isActive: categoryData.isActive,
        });

        await this.categoryRepository.save(category);
      }

      this.logger.log(
        `${categoriesData.length}개의 카테고리가 생성되었습니다.`,
      );
    } catch (error) {
      this.logger.error('카테고리 초기화 중 오류:', error);
      throw error;
    }
  }

  private async initializeProducts(): Promise<void> {
    try {
      const productsPath = path.join(__dirname, '..', 'data', 'products.json');
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

      for (const productData of productsData) {
        // 카테고리 조회
        const category = await this.categoryRepository.findOne({
          where: { id: productData.categoryId },
        });

        if (!category) {
          this.logger.warn(
            `카테고리 ID ${productData.categoryId}를 찾을 수 없습니다. 상품 ID: ${productData.id}`,
          );
          continue;
        }

        const product = this.productRepository.create({
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          categoryId: productData.categoryId,
          sellerId: productData.sellerId || 'default-seller',
          mainImage: productData.image || productData.imageUrl,
          rating: productData.rating,
          averageRating: productData.averageRating,
          reviewCount: productData.reviewCount,
          isNew: productData.isNew,
          isFeatured: productData.isFeatured,
          discountPercentage: productData.discountPercentage,
          createdAt: new Date(productData.createdAt),
        });

        await this.productRepository.save(product);
      }

      this.logger.log(`${productsData.length}개의 상품이 생성되었습니다.`);
    } catch (error) {
      this.logger.error('상품 초기화 중 오류:', error);
      throw error;
    }
  }
}
