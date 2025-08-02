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

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: '상품 생성' })
  @ApiResponse({
    status: 201,
    description: '상품이 성공적으로 생성되었습니다.',
    type: Product,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
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

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: '상품 이미지 업로드' })
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
    const images = await this.productService.uploadImages(id, files);
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
