import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductOptionDto {
  @ApiProperty({ description: '옵션 타입', example: 'color' })
  @IsString()
  optionType: string;

  @ApiProperty({ description: '옵션 이름', example: '색상' })
  @IsString()
  optionName: string;

  @ApiProperty({ description: '옵션 값', example: '블랙' })
  @IsString()
  optionValue: string;

  @ApiPropertyOptional({ description: '추가 가격', example: 0 })
  @IsOptional()
  @IsNumber()
  additionalPrice?: number;

  @ApiPropertyOptional({ description: '재고', example: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ description: 'SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: '정렬 순서', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateProductDto {
  @ApiProperty({ description: '상품명', example: '심플 티셔츠' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '상품 설명',
    example: '편안한 착용감과 심플한 디자인이 매력적인 기본 티셔츠입니다.',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: '가격', example: 29000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: '원가', example: 29000 })
  @IsNumber()
  originalPrice: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional({ description: '메인 이미지 URL' })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional({ description: '평점', example: 4.5 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: '평균 평점', example: 4.5 })
  @IsOptional()
  @IsNumber()
  averageRating?: number;

  @ApiPropertyOptional({ description: '리뷰 수', example: 123 })
  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @ApiPropertyOptional({ description: '신상품 여부', example: false })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiPropertyOptional({ description: '추천 상품 여부', example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: '활성화 상태', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '할인액', example: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ description: '할인율', example: 0 })
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;


  @ApiPropertyOptional({ description: '재고', example: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ description: 'SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: '무게', example: 0.5 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    description: '치수',
    example: { length: 10, width: 20, height: 30 },
  })
  @IsOptional()
  @IsObject()
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };

  @ApiPropertyOptional({ description: '상품 스펙' })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ description: '상품 옵션', type: [CreateProductOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionDto)
  options?: CreateProductOptionDto[];
}