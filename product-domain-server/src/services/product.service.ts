import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product, ProductOption, ProductImage } from '@entities/index';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from '@dto/index';
import { S3UploadService } from './s3-upload.service';
import { BaseError, ErrorCode } from '@ecommerce/common';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductOption)
    private productOptionRepository: Repository<ProductOption>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    private s3UploadService: S3UploadService,
  ) {}

  /**
   * 이미지 URL을 포함한 상품 생성 (새로운 방식)
   * @param createProductDto 상품 생성 데이터 (이미지 URL 포함)
   */
  async createWithImageUrls(
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const { options, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    // 옵션 생성
    if (options && options.length > 0) {
      const productOptions = options.map((option) =>
        this.productOptionRepository.create({
          ...option,
          productId: savedProduct.id,
        }),
      );
      await this.productOptionRepository.save(productOptions);
    }

    // 이미지 URL이 있으면 ProductImage 엔티티 생성
    if (createProductDto.imageUrls && createProductDto.imageUrls.length > 0) {
      await this.createProductImagesFromUrls(
        savedProduct.id,
        createProductDto.imageUrls,
      );
    }

    return this.findOne(savedProduct.id);
  }

  /**
   * 기존 방식 (multipart 파일 처리) - 호환성 유지
   */
  async create(
    createProductDto: CreateProductDto,
    files?: Express.Multer.File[],
  ): Promise<Product> {
    const { options, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    if (options && options.length > 0) {
      const productOptions = options.map((option) =>
        this.productOptionRepository.create({
          ...option,
          productId: savedProduct.id,
        }),
      );
      await this.productOptionRepository.save(productOptions);
    }

    // 이미지 파일이 있으면 업로드 처리
    if (files && files.length > 0) {
      await this.uploadImages(savedProduct.id, files);
    }

    return this.findOne(savedProduct.id);
  }

  /**
   * 이미지 URL로부터 ProductImage 엔티티 생성
   */
  private async createProductImagesFromUrls(
    productId: number,
    imageUrls: string[],
  ): Promise<void> {
    const productImages = imageUrls.map((url, index) => {
      // URL에서 파일명 추출
      const fileName = url.split('/').pop() || `image_${index}`;

      return this.productImageRepository.create({
        productId,
        imageUrl: url,
        originalUrl: url,
        fileName,
        fileType: 'image/jpeg', // 기본값, 실제로는 URL에서 추출하거나 별도로 저장
        fileSize: 0, // 실제 크기는 별도 API로 조회 가능
        sortOrder: index,
        isMain: index === 0,
      });
    });

    await this.productImageRepository.save(productImages);

    // 메인 이미지 설정
    if (imageUrls.length > 0) {
      await this.productRepository.update(productId, {
        mainImage: imageUrls[0],
      });
    }
  }

  async findAll(queryDto: QueryProductDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      sellerId,
      minPrice,
      maxPrice,
      isNew,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.options', 'options')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = :isActive', { isActive: true });

    this.applyFilters(queryBuilder, {
      search,
      categoryId,
      sellerId,
      minPrice,
      maxPrice,
      isNew,
      isFeatured,
    });

    this.applySorting(queryBuilder, sortBy, sortOrder);

    const [products, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: ['category', 'options', 'images'],
    });

    if (!product) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 상품을 찾을 수 없습니다.`,
      );
    }

    return product;
  }

  async findBySeller(sellerId: string, queryDto?: QueryProductDto) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      minPrice,
      maxPrice,
      isNew,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto || {};

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.options', 'options')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.sellerId = :sellerId', { sellerId })
      .andWhere('product.isActive = :isActive', { isActive: true });

    this.applyFilters(queryBuilder, {
      search,
      categoryId,
      minPrice,
      maxPrice,
      isNew,
      isFeatured,
    });

    this.applySorting(queryBuilder, sortBy, sortOrder);

    const [products, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { options, ...productData } = updateProductDto;

    const product = await this.findOne(id);

    Object.assign(product, productData);
    await this.productRepository.save(product);

    if (options) {
      await this.productOptionRepository.delete({ productId: id });

      if (options.length > 0) {
        const productOptions = options.map((option) =>
          this.productOptionRepository.create({
            ...option,
            productId: id,
          }),
        );
        await this.productOptionRepository.save(productOptions);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);

    product.isActive = false;
    await this.productRepository.save(product);
  }

  /**
   * 상품 생성 전 이미지 업로드 (독립적)
   * @param files 업로드할 이미지 파일들
   * @returns 업로드된 이미지 URL 배열
   */
  async uploadProductImages(files: Express.Multer.File[]): Promise<string[]> {
    // 파일 유효성 검사
    this.validateImageFiles(files);

    // 임시 폴더에 업로드 (나중에 상품 생성시 이동)
    const uploadResults = await this.s3UploadService.uploadMultipleFiles(
      files,
      'images/products',
    );

    return uploadResults.map((result) => result.url);
  }

  async uploadImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<ProductImage[]> {
    // 파일 유효성 검사
    this.validateImageFiles(files);

    const product = await this.findOne(productId);

    const uploadResults = await this.s3UploadService.uploadMultipleFiles(
      files,
      `products/${productId}`,
    );

    const productImages = uploadResults.map((result, index) =>
      this.productImageRepository.create({
        productId,
        imageUrl: result.url,
        originalUrl: result.url,
        fileName: result.originalName,
        fileType: result.mimeType,
        fileSize: result.size,
        sortOrder: index,
        isMain: index === 0,
      }),
    );

    const savedImages = await this.productImageRepository.save(productImages);

    if (savedImages.length > 0 && !product.mainImage) {
      product.mainImage = savedImages[0].imageUrl;
      await this.productRepository.save(product);
    }

    return savedImages;
  }

  async deleteImage(productId: number, imageId: number): Promise<void> {
    const image = await this.productImageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    const key = image.imageUrl.split('/').slice(-2).join('/');
    await this.s3UploadService.deleteFile(key);
    await this.productImageRepository.remove(image);

    if (image.isMain) {
      const remainingImages = await this.productImageRepository.find({
        where: { productId },
        order: { sortOrder: 'ASC' },
      });

      if (remainingImages.length > 0) {
        remainingImages[0].isMain = true;
        await this.productImageRepository.save(remainingImages[0]);

        const product = await this.productRepository.findOne({
          where: { id: productId },
        });
        product.mainImage = remainingImages[0].imageUrl;
        await this.productRepository.save(product);
      } else {
        const product = await this.productRepository.findOne({
          where: { id: productId },
        });
        product.mainImage = null;
        await this.productRepository.save(product);
      }
    }
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Product>,
    filters: any,
  ): void {
    const {
      search,
      categoryId,
      sellerId,
      minPrice,
      maxPrice,
      isNew,
      isFeatured,
    } = filters;

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (sellerId) {
      queryBuilder.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (isNew !== undefined) {
      queryBuilder.andWhere('product.isNew = :isNew', { isNew });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Product>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): void {
    const allowedSortFields = ['createdAt', 'price', 'name', 'rating'];

    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(`product.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('product.createdAt', 'DESC');
    }
  }

  /**
   * 이미지 파일 유효성 검사
   */
  private validateImageFiles(files: Express.Multer.File[]): void {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
    ];
    const MAX_FILE_COUNT = 10;

    if (!files || files.length === 0) {
      throw new BaseError(
        ErrorCode.VALIDATION_ERROR,
        '업로드할 이미지 파일이 없습니다.',
      );
    }

    if (files.length > MAX_FILE_COUNT) {
      throw new BaseError(
        ErrorCode.VALIDATION_ERROR,
        `이미지는 최대 ${MAX_FILE_COUNT}개까지 업로드 가능합니다.`,
      );
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
        throw new BaseError(
          ErrorCode.VALIDATION_ERROR,
          `이미지 파일 크기가 10MB를 초과합니다. (파일: ${file.originalname}, 크기: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        );
      }

      // 파일 타입 검증
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new BaseError(
          ErrorCode.VALIDATION_ERROR,
          `지원하지 않는 이미지 형식입니다. (파일: ${file.originalname}, 형식: ${file.mimetype})`,
        );
      }

      // 파일명 검증
      if (!file.originalname || file.originalname.trim() === '') {
        throw new BaseError(
          ErrorCode.VALIDATION_ERROR,
          '이미지 파일명이 유효하지 않습니다.',
        );
      }

      // 파일 내용 검증 (빈 파일 체크)
      if (file.size === 0) {
        throw new BaseError(
          ErrorCode.VALIDATION_ERROR,
          `빈 파일은 업로드할 수 없습니다. (파일: ${file.originalname})`,
        );
      }
    }
  }
}
