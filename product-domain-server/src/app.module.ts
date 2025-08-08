import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { getDatabaseConfig } from '@config/database.config';
import {
  Product,
  Category,
  ProductOption,
  ProductImage,
} from '@entities/index';
import { ProductController } from '@controllers/product.controller';
import { CategoryController } from '@controllers/category.controller';
import { ProductService } from '@services/product.service';
import { CategoryService } from '@services/category.service';
import { S3UploadService } from '@services/s3-upload.service';
import { DataInitializerService } from '@services/data-initializer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Product, Category, ProductOption, ProductImage]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        // 허용된 이미지 타입 검증
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/avif',
          'image/gif',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `지원하지 않는 이미지 형식입니다. (형식: ${file.mimetype})`,
            ),
            false,
          );
        }
      },
    }),
  ],
  controllers: [ProductController, CategoryController],
  providers: [
    ProductService,
    CategoryService,
    S3UploadService,
    DataInitializerService,
  ],
})
export class AppModule {}
