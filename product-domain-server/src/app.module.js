"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var platform_express_1 = require("@nestjs/platform-express");
var multer_1 = require("multer");
var database_config_1 = require("@config/database.config");
var index_1 = require("@entities/index");
var product_controller_1 = require("@controllers/product.controller");
var category_controller_1 = require("@controllers/category.controller");
var metrics_controller_1 = require("@controllers/metrics.controller");
var product_service_1 = require("@services/product.service");
var category_service_1 = require("@services/category.service");
var s3_upload_service_1 = require("@services/s3-upload.service");
var data_initializer_service_1 = require("@services/data-initializer.service");
// import { ProductMetricsService } from '@services/product-metrics.service'; // 글로벌 메트릭으로 대체
// 메트릭은 글로벌 시스템(/monitoring/application-metrics/)에서 수집
// Product 서버는 간단한 상태 메트릭만 제공
var AppModule = function () {
    var _classDecorators = [(0, common_1.Module)({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: ['.env.local', '.env'],
                }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: database_config_1.getDatabaseConfig,
                    inject: [config_1.ConfigService],
                }),
                typeorm_1.TypeOrmModule.forFeature([index_1.Product, index_1.Category, index_1.ProductOption, index_1.ProductImage]),
                platform_express_1.MulterModule.register({
                    storage: (0, multer_1.memoryStorage)(),
                    limits: {
                        fileSize: 10 * 1024 * 1024, // 10MB
                    },
                    fileFilter: function (req, file, cb) {
                        // 허용된 이미지 타입 검증
                        var allowedTypes = [
                            'image/jpeg',
                            'image/jpg',
                            'image/png',
                            'image/webp',
                            'image/avif',
                            'image/gif',
                        ];
                        if (allowedTypes.includes(file.mimetype)) {
                            cb(null, true);
                        }
                        else {
                            cb(new Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC774\uBBF8\uC9C0 \uD615\uC2DD\uC785\uB2C8\uB2E4. (\uD615\uC2DD: ".concat(file.mimetype, ")")), false);
                        }
                    },
                }),
            ],
            controllers: [product_controller_1.ProductController, category_controller_1.CategoryController, metrics_controller_1.MetricsController],
            providers: [
                product_service_1.ProductService,
                category_service_1.CategoryService,
                s3_upload_service_1.S3UploadService,
                data_initializer_service_1.DataInitializerService,
                // ProductMetricsService 제거: 글로벌 메트릭 시스템으로 대체
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AppModule = _classThis = /** @class */ (function () {
        function AppModule_1() {
        }
        AppModule_1.prototype.configure = function (consumer) {
            // 글로벌 메트릭 시스템에서 자동 수집하므로 별도 미들웨어 불필요
            console.log('Product Domain Server: HTTP 메트릭은 글로벌 시스템에서 수집');
        };
        return AppModule_1;
    }());
    __setFunctionName(_classThis, "AppModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
}();
exports.AppModule = AppModule;
