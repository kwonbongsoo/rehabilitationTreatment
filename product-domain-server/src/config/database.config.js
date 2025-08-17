"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
var index_1 = require("@entities/index");
var getDatabaseConfig = function (configService) { return ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('POSTGRES_USER', 'postgres'),
    password: configService.get('POSTGRES_PASSWORD', 'postgres'),
    database: configService.get('POSTGRES_DB', 'product_db'),
    entities: [index_1.Product, index_1.Category, index_1.ProductOption, index_1.ProductImage],
    synchronize: true, // 개발/프로덕션 모두 스키마 자동 생성
    logging: configService.get('NODE_ENV') === 'development',
    dropSchema: false, // 스키마 초기화 방지
}); };
exports.getDatabaseConfig = getDatabaseConfig;
