"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
var typeorm_1 = require("typeorm");
var index_1 = require("../entities/index");
var dotenv = require("dotenv");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'product_db',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [index_1.Product, index_1.Category, index_1.ProductOption, index_1.ProductImage],
    migrations: ['src/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations_history',
});
