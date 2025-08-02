import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: '카테고리 이름', example: '의류' })
  @IsString()
  name: string;

  @ApiProperty({ description: '카테고리 슬러그', example: 'clothing' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: '아이콘 코드', example: '👕' })
  @IsOptional()
  @IsString()
  iconCode?: string;

  @ApiPropertyOptional({ description: '정렬 순서', example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ description: '활성화 상태', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
