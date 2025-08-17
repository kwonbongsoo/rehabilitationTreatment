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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataInitializerService = void 0;
var common_1 = require("@nestjs/common");
var fs = require("fs");
var path = require("path");
var DataInitializerService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var DataInitializerService = _classThis = /** @class */ (function () {
        function DataInitializerService_1(categoryRepository, productRepository) {
            this.categoryRepository = categoryRepository;
            this.productRepository = productRepository;
            this.logger = new common_1.Logger(DataInitializerService.name);
        }
        DataInitializerService_1.prototype.initializeData = function () {
            return __awaiter(this, void 0, void 0, function () {
                var retries, error_1, categoryCount, productCount, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 12, , 13]);
                            this.logger.log('데이터 초기화를 시작합니다...');
                            retries = 5;
                            _a.label = 1;
                        case 1:
                            if (!(retries > 0)) return [3 /*break*/, 7];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 6]);
                            return [4 /*yield*/, this.categoryRepository.query('SELECT 1 FROM categories LIMIT 1')];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 7]; // 테이블이 존재하면 루프 종료
                        case 4:
                            error_1 = _a.sent();
                            retries--;
                            if (retries === 0) {
                                this.logger.error('테이블이 생성되지 않았습니다. synchronize 설정을 확인하세요.');
                                throw new Error('Database tables not found');
                            }
                            this.logger.log("\uD14C\uC774\uBE14 \uC0DD\uC131 \uB300\uAE30 \uC911... (".concat(retries, "\uD68C \uC7AC\uC2DC\uB3C4 \uB0A8\uC74C)"));
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                        case 5:
                            _a.sent(); // 1초 대기
                            return [3 /*break*/, 6];
                        case 6: return [3 /*break*/, 1];
                        case 7: return [4 /*yield*/, this.categoryRepository.count()];
                        case 8:
                            categoryCount = _a.sent();
                            return [4 /*yield*/, this.productRepository.count()];
                        case 9:
                            productCount = _a.sent();
                            if (categoryCount > 0 || productCount > 0) {
                                this.logger.log("\uAE30\uC874 \uB370\uC774\uD130\uAC00 \uC874\uC7AC\uD569\uB2C8\uB2E4. (\uCE74\uD14C\uACE0\uB9AC: ".concat(categoryCount, ", \uC0C1\uD488: ").concat(productCount, ")"));
                                return [2 /*return*/];
                            }
                            // 카테고리 데이터 초기화
                            return [4 /*yield*/, this.initializeCategories()];
                        case 10:
                            // 카테고리 데이터 초기화
                            _a.sent();
                            // 상품 데이터 초기화
                            return [4 /*yield*/, this.initializeProducts()];
                        case 11:
                            // 상품 데이터 초기화
                            _a.sent();
                            this.logger.log('데이터 초기화가 완료되었습니다.');
                            return [3 /*break*/, 13];
                        case 12:
                            error_2 = _a.sent();
                            this.logger.error('데이터 초기화 중 오류가 발생했습니다:', error_2);
                            throw error_2;
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        DataInitializerService_1.prototype.initializeCategories = function () {
            return __awaiter(this, void 0, void 0, function () {
                var categoriesPath, categoriesData, _i, categoriesData_1, categoryData, category, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            categoriesPath = path.join(__dirname, '..', 'data', 'categories.json');
                            categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
                            _i = 0, categoriesData_1 = categoriesData;
                            _a.label = 1;
                        case 1:
                            if (!(_i < categoriesData_1.length)) return [3 /*break*/, 4];
                            categoryData = categoriesData_1[_i];
                            category = this.categoryRepository.create({
                                id: categoryData.id,
                                name: categoryData.name,
                                slug: categoryData.slug,
                                iconCode: categoryData.iconCode,
                                isActive: categoryData.isActive,
                            });
                            return [4 /*yield*/, this.categoryRepository.save(category)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            this.logger.log("".concat(categoriesData.length, "\uAC1C\uC758 \uCE74\uD14C\uACE0\uB9AC\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4."));
                            return [3 /*break*/, 6];
                        case 5:
                            error_3 = _a.sent();
                            this.logger.error('카테고리 초기화 중 오류:', error_3);
                            throw error_3;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        DataInitializerService_1.prototype.initializeProducts = function () {
            return __awaiter(this, void 0, void 0, function () {
                var productsPath, productsData, _i, productsData_1, productData, category, product, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            productsPath = path.join(__dirname, '..', 'data', 'products.json');
                            productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
                            _i = 0, productsData_1 = productsData;
                            _a.label = 1;
                        case 1:
                            if (!(_i < productsData_1.length)) return [3 /*break*/, 5];
                            productData = productsData_1[_i];
                            return [4 /*yield*/, this.categoryRepository.findOne({
                                    where: { id: productData.categoryId },
                                })];
                        case 2:
                            category = _a.sent();
                            if (!category) {
                                this.logger.warn("\uCE74\uD14C\uACE0\uB9AC ID ".concat(productData.categoryId, "\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0C1\uD488 ID: ").concat(productData.id));
                                return [3 /*break*/, 4];
                            }
                            product = this.productRepository.create({
                                id: productData.id,
                                name: productData.name,
                                description: productData.description,
                                price: productData.price,
                                originalPrice: productData.originalPrice,
                                categoryId: productData.categoryId,
                                sellerId: productData.sellerId || 'default-seller',
                                mainImage: productData.image || productData.imageUrl,
                                rating: productData.rating,
                                averageRating: productData.averageRating,
                                reviewCount: productData.reviewCount,
                                isNew: productData.isNew,
                                isFeatured: productData.isFeatured,
                                discountPercentage: productData.discountPercentage,
                                createdAt: new Date(productData.createdAt),
                            });
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5:
                            this.logger.log("".concat(productsData.length, "\uAC1C\uC758 \uC0C1\uD488\uC774 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4."));
                            return [3 /*break*/, 7];
                        case 6:
                            error_4 = _a.sent();
                            this.logger.error('상품 초기화 중 오류:', error_4);
                            throw error_4;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        return DataInitializerService_1;
    }());
    __setFunctionName(_classThis, "DataInitializerService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DataInitializerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DataInitializerService = _classThis;
}();
exports.DataInitializerService = DataInitializerService;
