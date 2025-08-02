import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product, ProductOption, ProductImage } from '@entities/index';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from '@dto/index';
import { S3UploadService } from './s3-upload.service';

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

  async create(createProductDto: CreateProductDto): Promise<Product> {
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

    return this.findOne(savedProduct.id);
  }

  async findAll(queryDto: QueryProductDto) {
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

  async uploadImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<ProductImage[]> {
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
    const { search, categoryId, minPrice, maxPrice, isNew, isFeatured } =
      filters;

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
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
}
