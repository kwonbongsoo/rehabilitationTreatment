import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CategoryService } from '@services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '@dto/index';
import { Category } from '@entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: '카테고리 생성' })
  @ApiResponse({ status: 201, description: '카테고리가 성공적으로 생성되었습니다.', type: Category })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이미 존재하는 슬러그입니다.' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: '카테고리 목록 조회' })
  @ApiResponse({ status: 200, description: '카테고리 목록을 성공적으로 조회했습니다.', type: [Category] })
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '카테고리 상세 조회' })
  @ApiResponse({ status: 200, description: '카테고리를 성공적으로 조회했습니다.', type: Category })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없습니다.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: '슬러그로 카테고리 조회' })
  @ApiResponse({ status: 200, description: '카테고리를 성공적으로 조회했습니다.', type: Category })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없습니다.' })
  async findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoryService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: '카테고리 수정' })
  @ApiResponse({ status: 200, description: '카테고리가 성공적으로 수정되었습니다.', type: Category })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: '이미 존재하는 슬러그입니다.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '카테고리 삭제' })
  @ApiResponse({ status: 200, description: '카테고리가 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없습니다.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.categoryService.remove(id);
    return { message: '카테고리가 성공적으로 삭제되었습니다.' };
  }
}