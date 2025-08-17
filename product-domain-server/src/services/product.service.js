"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
var common_1 = require("@nestjs/common");
var common_2 = require("@ecommerce/common");
var ProductService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ProductService = _classThis = /** @class */ (function () {
        function ProductService_1(productRepository, productOptionRepository, productImageRepository, s3UploadService) {
            this.productRepository = productRepository;
            this.productOptionRepository = productOptionRepository;
            this.productImageRepository = productImageRepository;
            this.s3UploadService = s3UploadService;
        }
        /**
         * 이미지 URL을 포함한 상품 생성 (새로운 방식)
         * @param createProductDto 상품 생성 데이터 (이미지 URL 포함)
         */
        ProductService_1.prototype.createWithImageUrls = function (createProductDto) {
            return __awaiter(this, void 0, void 0, function () {
                var options, productData, product, savedProduct, productOptions;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = createProductDto.options, productData = __rest(createProductDto, ["options"]);
                            product = this.productRepository.create(productData);
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 1:
                            savedProduct = _a.sent();
                            if (!(options && options.length > 0)) return [3 /*break*/, 3];
                            productOptions = options.map(function (option) {
                                return _this.productOptionRepository.create(__assign(__assign({}, option), { productId: savedProduct.id }));
                            });
                            return [4 /*yield*/, this.productOptionRepository.save(productOptions)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            if (!(createProductDto.imageUrls && createProductDto.imageUrls.length > 0)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.createProductImagesFromUrls(savedProduct.id, createProductDto.imageUrls)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/, this.findOne(savedProduct.id)];
                    }
                });
            });
        };
        /**
         * 기존 방식 (multipart 파일 처리) - 호환성 유지
         */
        ProductService_1.prototype.create = function (createProductDto, files) {
            return __awaiter(this, void 0, void 0, function () {
                var options, productData, product, savedProduct, productOptions;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = createProductDto.options, productData = __rest(createProductDto, ["options"]);
                            product = this.productRepository.create(productData);
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 1:
                            savedProduct = _a.sent();
                            if (!(options && options.length > 0)) return [3 /*break*/, 3];
                            productOptions = options.map(function (option) {
                                return _this.productOptionRepository.create(__assign(__assign({}, option), { productId: savedProduct.id }));
                            });
                            return [4 /*yield*/, this.productOptionRepository.save(productOptions)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            if (!(files && files.length > 0)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.uploadImages(savedProduct.id, files)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/, this.findOne(savedProduct.id)];
                    }
                });
            });
        };
        /**
         * 이미지 URL로부터 ProductImage 엔티티 생성
         */
        ProductService_1.prototype.createProductImagesFromUrls = function (productId, imageUrls) {
            return __awaiter(this, void 0, void 0, function () {
                var productImages;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            productImages = imageUrls.map(function (url, index) {
                                // URL에서 파일명 추출
                                var fileName = url.split('/').pop() || "image_".concat(index);
                                return _this.productImageRepository.create({
                                    productId: productId,
                                    imageUrl: url,
                                    originalUrl: url,
                                    fileName: fileName,
                                    fileType: 'image/jpeg', // 기본값, 실제로는 URL에서 추출하거나 별도로 저장
                                    fileSize: 0, // 실제 크기는 별도 API로 조회 가능
                                    sortOrder: index,
                                    isMain: index === 0,
                                });
                            });
                            return [4 /*yield*/, this.productImageRepository.save(productImages)];
                        case 1:
                            _a.sent();
                            if (!(imageUrls.length > 0)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.productRepository.update(productId, {
                                    mainImage: imageUrls[0],
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        ProductService_1.prototype.findAll = function (queryDto) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, page, _b, limit, search, categoryId, sellerId, minPrice, maxPrice, isNew, isFeatured, _c, sortBy, _d, sortOrder, queryBuilder, _e, products, total;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _a = queryDto.page, page = _a === void 0 ? 1 : _a, _b = queryDto.limit, limit = _b === void 0 ? 10 : _b, search = queryDto.search, categoryId = queryDto.categoryId, sellerId = queryDto.sellerId, minPrice = queryDto.minPrice, maxPrice = queryDto.maxPrice, isNew = queryDto.isNew, isFeatured = queryDto.isFeatured, _c = queryDto.sortBy, sortBy = _c === void 0 ? 'createdAt' : _c, _d = queryDto.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                            queryBuilder = this.productRepository
                                .createQueryBuilder('product')
                                .leftJoinAndSelect('product.category', 'category')
                                .leftJoinAndSelect('product.options', 'options')
                                .leftJoinAndSelect('product.images', 'images')
                                .where('product.isActive = :isActive', { isActive: true });
                            this.applyFilters(queryBuilder, {
                                search: search,
                                categoryId: categoryId,
                                sellerId: sellerId,
                                minPrice: minPrice,
                                maxPrice: maxPrice,
                                isNew: isNew,
                                isFeatured: isFeatured,
                            });
                            this.applySorting(queryBuilder, sortBy, sortOrder);
                            return [4 /*yield*/, queryBuilder
                                    .skip((page - 1) * limit)
                                    .take(limit)
                                    .getManyAndCount()];
                        case 1:
                            _e = _f.sent(), products = _e[0], total = _e[1];
                            return [2 /*return*/, {
                                    products: products,
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    totalPages: Math.ceil(total / limit),
                                }];
                    }
                });
            });
        };
        ProductService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productRepository.findOne({
                                where: { id: id, isActive: true },
                                relations: ['category', 'options', 'images'],
                            })];
                        case 1:
                            product = _a.sent();
                            if (!product) {
                                throw new common_1.NotFoundException("ID ".concat(id, "\uC5D0 \uD574\uB2F9\uD558\uB294 \uC0C1\uD488\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."));
                            }
                            return [2 /*return*/, product];
                    }
                });
            });
        };
        ProductService_1.prototype.findBySeller = function (sellerId, queryDto) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, page, _c, limit, search, categoryId, minPrice, maxPrice, isNew, isFeatured, _d, sortBy, _e, sortOrder, queryBuilder, _f, products, total;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _a = queryDto || {}, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, search = _a.search, categoryId = _a.categoryId, minPrice = _a.minPrice, maxPrice = _a.maxPrice, isNew = _a.isNew, isFeatured = _a.isFeatured, _d = _a.sortBy, sortBy = _d === void 0 ? 'createdAt' : _d, _e = _a.sortOrder, sortOrder = _e === void 0 ? 'DESC' : _e;
                            queryBuilder = this.productRepository
                                .createQueryBuilder('product')
                                .leftJoinAndSelect('product.category', 'category')
                                .leftJoinAndSelect('product.options', 'options')
                                .leftJoinAndSelect('product.images', 'images')
                                .where('product.sellerId = :sellerId', { sellerId: sellerId })
                                .andWhere('product.isActive = :isActive', { isActive: true });
                            this.applyFilters(queryBuilder, {
                                search: search,
                                categoryId: categoryId,
                                minPrice: minPrice,
                                maxPrice: maxPrice,
                                isNew: isNew,
                                isFeatured: isFeatured,
                            });
                            this.applySorting(queryBuilder, sortBy, sortOrder);
                            return [4 /*yield*/, queryBuilder
                                    .skip((page - 1) * limit)
                                    .take(limit)
                                    .getManyAndCount()];
                        case 1:
                            _f = _g.sent(), products = _f[0], total = _f[1];
                            return [2 /*return*/, {
                                    products: products,
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    totalPages: Math.ceil(total / limit),
                                }];
                    }
                });
            });
        };
        ProductService_1.prototype.update = function (id, updateProductDto) {
            return __awaiter(this, void 0, void 0, function () {
                var options, productData, product, productOptions;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = updateProductDto.options, productData = __rest(updateProductDto, ["options"]);
                            return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            product = _a.sent();
                            Object.assign(product, productData);
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 2:
                            _a.sent();
                            if (!options) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.productOptionRepository.delete({ productId: id })];
                        case 3:
                            _a.sent();
                            if (!(options.length > 0)) return [3 /*break*/, 5];
                            productOptions = options.map(function (option) {
                                return _this.productOptionRepository.create(__assign(__assign({}, option), { productId: id }));
                            });
                            return [4 /*yield*/, this.productOptionRepository.save(productOptions)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/, this.findOne(id)];
                    }
                });
            });
        };
        ProductService_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            product = _a.sent();
                            product.isActive = false;
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * 상품 생성 전 이미지 업로드 (독립적)
         * @param files 업로드할 이미지 파일들
         * @returns 업로드된 이미지 URL 배열
         */
        ProductService_1.prototype.uploadProductImages = function (files) {
            return __awaiter(this, void 0, void 0, function () {
                var uploadResults;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // 파일 유효성 검사
                            this.validateImageFiles(files);
                            return [4 /*yield*/, this.s3UploadService.uploadMultipleFiles(files, 'images/products')];
                        case 1:
                            uploadResults = _a.sent();
                            return [2 /*return*/, uploadResults.map(function (result) { return result.url; })];
                    }
                });
            });
        };
        ProductService_1.prototype.uploadImages = function (productId, files) {
            return __awaiter(this, void 0, void 0, function () {
                var product, uploadResults, productImages, savedImages;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // 파일 유효성 검사
                            this.validateImageFiles(files);
                            return [4 /*yield*/, this.findOne(productId)];
                        case 1:
                            product = _a.sent();
                            return [4 /*yield*/, this.s3UploadService.uploadMultipleFiles(files, "products/".concat(productId))];
                        case 2:
                            uploadResults = _a.sent();
                            productImages = uploadResults.map(function (result, index) {
                                return _this.productImageRepository.create({
                                    productId: productId,
                                    imageUrl: result.url,
                                    originalUrl: result.url,
                                    fileName: result.originalName,
                                    fileType: result.mimeType,
                                    fileSize: result.size,
                                    sortOrder: index,
                                    isMain: index === 0,
                                });
                            });
                            return [4 /*yield*/, this.productImageRepository.save(productImages)];
                        case 3:
                            savedImages = _a.sent();
                            if (!(savedImages.length > 0 && !product.mainImage)) return [3 /*break*/, 5];
                            product.mainImage = savedImages[0].imageUrl;
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/, savedImages];
                    }
                });
            });
        };
        ProductService_1.prototype.deleteImage = function (productId, imageId) {
            return __awaiter(this, void 0, void 0, function () {
                var image, key, remainingImages, product, product;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productImageRepository.findOne({
                                where: { id: imageId, productId: productId },
                            })];
                        case 1:
                            image = _a.sent();
                            if (!image) {
                                throw new common_1.NotFoundException('이미지를 찾을 수 없습니다.');
                            }
                            key = image.imageUrl.split('/').slice(-2).join('/');
                            return [4 /*yield*/, this.s3UploadService.deleteFile(key)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.productImageRepository.remove(image)];
                        case 3:
                            _a.sent();
                            if (!image.isMain) return [3 /*break*/, 11];
                            return [4 /*yield*/, this.productImageRepository.find({
                                    where: { productId: productId },
                                    order: { sortOrder: 'ASC' },
                                })];
                        case 4:
                            remainingImages = _a.sent();
                            if (!(remainingImages.length > 0)) return [3 /*break*/, 8];
                            remainingImages[0].isMain = true;
                            return [4 /*yield*/, this.productImageRepository.save(remainingImages[0])];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, this.productRepository.findOne({
                                    where: { id: productId },
                                })];
                        case 6:
                            product = _a.sent();
                            product.mainImage = remainingImages[0].imageUrl;
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 7:
                            _a.sent();
                            return [3 /*break*/, 11];
                        case 8: return [4 /*yield*/, this.productRepository.findOne({
                                where: { id: productId },
                            })];
                        case 9:
                            product = _a.sent();
                            product.mainImage = null;
                            return [4 /*yield*/, this.productRepository.save(product)];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        ProductService_1.prototype.applyFilters = function (queryBuilder, filters) {
            var search = filters.search, categoryId = filters.categoryId, sellerId = filters.sellerId, minPrice = filters.minPrice, maxPrice = filters.maxPrice, isNew = filters.isNew, isFeatured = filters.isFeatured;
            if (search) {
                queryBuilder.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', { search: "%".concat(search, "%") });
            }
            if (categoryId) {
                queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: categoryId });
            }
            if (sellerId) {
                queryBuilder.andWhere('product.sellerId = :sellerId', { sellerId: sellerId });
            }
            if (minPrice !== undefined) {
                queryBuilder.andWhere('product.price >= :minPrice', { minPrice: minPrice });
            }
            if (maxPrice !== undefined) {
                queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: maxPrice });
            }
            if (isNew !== undefined) {
                queryBuilder.andWhere('product.isNew = :isNew', { isNew: isNew });
            }
            if (isFeatured !== undefined) {
                queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: isFeatured });
            }
        };
        ProductService_1.prototype.applySorting = function (queryBuilder, sortBy, sortOrder) {
            var allowedSortFields = ['createdAt', 'price', 'name', 'rating'];
            if (allowedSortFields.includes(sortBy)) {
                queryBuilder.orderBy("product.".concat(sortBy), sortOrder);
            }
            else {
                queryBuilder.orderBy('product.createdAt', 'DESC');
            }
        };
        /**
         * 이미지 파일 유효성 검사
         */
        ProductService_1.prototype.validateImageFiles = function (files) {
            var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            var ALLOWED_TYPES = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/webp',
                'image/avif',
                'image/gif',
            ];
            var MAX_FILE_COUNT = 10;
            if (!files || files.length === 0) {
                throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, '업로드할 이미지 파일이 없습니다.');
            }
            if (files.length > MAX_FILE_COUNT) {
                throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, "\uC774\uBBF8\uC9C0\uB294 \uCD5C\uB300 ".concat(MAX_FILE_COUNT, "\uAC1C\uAE4C\uC9C0 \uC5C5\uB85C\uB4DC \uAC00\uB2A5\uD569\uB2C8\uB2E4."));
            }
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                // 파일 크기 검증
                if (file.size > MAX_FILE_SIZE) {
                    throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, "\uC774\uBBF8\uC9C0 \uD30C\uC77C \uD06C\uAE30\uAC00 10MB\uB97C \uCD08\uACFC\uD569\uB2C8\uB2E4. (\uD30C\uC77C: ".concat(file.originalname, ", \uD06C\uAE30: ").concat((file.size / 1024 / 1024).toFixed(2), "MB)"));
                }
                // 파일 타입 검증
                if (!ALLOWED_TYPES.includes(file.mimetype)) {
                    throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, "\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uC774\uBBF8\uC9C0 \uD615\uC2DD\uC785\uB2C8\uB2E4. (\uD30C\uC77C: ".concat(file.originalname, ", \uD615\uC2DD: ").concat(file.mimetype, ")"));
                }
                // 파일명 검증
                if (!file.originalname || file.originalname.trim() === '') {
                    throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, '이미지 파일명이 유효하지 않습니다.');
                }
                // 파일 내용 검증 (빈 파일 체크)
                if (file.size === 0) {
                    throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, "\uBE48 \uD30C\uC77C\uC740 \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. (\uD30C\uC77C: ".concat(file.originalname, ")"));
                }
            }
        };
        return ProductService_1;
    }());
    __setFunctionName(_classThis, "ProductService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductService = _classThis;
}();
exports.ProductService = ProductService;
