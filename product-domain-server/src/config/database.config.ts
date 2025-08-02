import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  Product,
  Category,
  ProductOption,
  ProductImage,
} from '@entities/index';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('POSTGRES_USER', 'postgres'),
  password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
  database: configService.get<string>('POSTGRES_DB', 'product_db'),
  entities: [Product, Category, ProductOption, ProductImage],
  synchronize: true, // 개발/프로덕션 모두 스키마 자동 생성
  logging: configService.get<string>('NODE_ENV') === 'development',
  dropSchema: false, // 스키마 초기화 방지
});
