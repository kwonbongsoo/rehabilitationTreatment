import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { getDatabaseConfig } from '@config/database.config';
import { Product, Category, ProductOption, ProductImage } from '@entities/index';
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
      dest: './uploads',
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [ProductController, CategoryController],
  providers: [ProductService, CategoryService, S3UploadService, DataInitializerService],
})
export class AppModule {}