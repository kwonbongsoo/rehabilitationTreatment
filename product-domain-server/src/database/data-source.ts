import { DataSource } from 'typeorm';
import {
  Product,
  Category,
  ProductOption,
  ProductImage,
} from '../entities/index';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'product_db',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [Product, Category, ProductOption, ProductImage],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
});
