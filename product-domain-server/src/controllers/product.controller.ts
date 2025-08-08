import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductService } from '@services/product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from '@dto/index';
import { Product } from '@entities/product.entity';
import { BaseError, ErrorCode } from '@ecommerce/common';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: '상품 생성 (JSON)' })
  @ApiResponse({
    status: 201,
    description: '상품이 성공적으로 생성되었습니다.',
    type: Product,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.createWithImageUrls(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: '상품 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '상품 목록을 성공적으로 조회했습니다.',
  })
  async findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.findAll(queryDto);
  }

  @Get('seller/:sellerId')
  @ApiOperation({ summary: '판매자별 상품 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '판매자별 상품 목록을 성공적으로 조회했습니다.',
  })
  async findBySeller(
    @Param('sellerId') sellerId: string,
    @Query() queryDto: QueryProductDto,
  ) {
    return this.productService.findBySeller(sellerId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '상품 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '상품을 성공적으로 조회했습니다.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '상품 수정' })
  @ApiResponse({
    status: 200,
    description: '상품이 성공적으로 수정되었습니다.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '상품 삭제' })
  @ApiResponse({
    status: 200,
    description: '상품이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.productService.remove(id);
    return { message: '상품이 성공적으로 삭제되었습니다.' };
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: '이미지 업로드 (상품 생성 전)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '이미지가 성공적으로 업로드되었습니다.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        imageUrls: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BaseError(
        ErrorCode.VALIDATION_ERROR,
        '업로드할 파일이 없습니다.',
      );
    }

    // 방어 로직: 0바이트 또는 이미지가 아닌 파일 제거
    const validFiles = files.filter(
      (f) =>
        f &&
        f.size > 0 &&
        typeof f.mimetype === 'string' &&
        f.mimetype.startsWith('image/'),
    );
    if (validFiles.length === 0) {
      throw new BaseError(
        ErrorCode.VALIDATION_ERROR,
        '유효한 이미지 파일이 없습니다. (0바이트 또는 이미지 형식 아님)',
      );
    }

    const imageUrls = await this.productService.uploadProductImages(validFiles);
    return {
      message: '이미지가 성공적으로 업로드되었습니다.',
      imageUrls,
    };
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: '기존 상품에 이미지 추가' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '이미지가 성공적으로 업로드되었습니다.',
  })
  @ApiResponse({ status: 404, description: '상품을 찾을 수 없습니다.' })
  async uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 방어 로직: 0바이트 또는 이미지가 아닌 파일 제거
    const validFiles = files.filter(
      (f) =>
        f &&
        f.size > 0 &&
        typeof f.mimetype === 'string' &&
        f.mimetype.startsWith('image/'),
    );
    if (validFiles.length === 0) {
      throw new BaseError(
        ErrorCode.VALIDATION_ERROR,
        '유효한 이미지 파일이 없습니다. (0바이트 또는 이미지 형식 아님)',
      );
    }

    const images = await this.productService.uploadImages(id, validFiles);
    return {
      message: '이미지가 성공적으로 업로드되었습니다.',
      images,
    };
  }

  @Delete(':productId/images/:imageId')
  @ApiOperation({ summary: '상품 이미지 삭제' })
  @ApiResponse({
    status: 200,
    description: '이미지가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '이미지를 찾을 수 없습니다.' })
  async deleteImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<{ message: string }> {
    await this.productService.deleteImage(productId, imageId);
    return { message: '이미지가 성공적으로 삭제되었습니다.' };
  }
}
