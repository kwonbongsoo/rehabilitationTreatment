"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.ProductController = void 0;
var common_1 = require("@nestjs/common");
var platform_express_1 = require("@nestjs/platform-express");
var swagger_1 = require("@nestjs/swagger");
var product_entity_1 = require("@entities/product.entity");
var common_2 = require("@ecommerce/common");
var ProductController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Products'), (0, common_1.Controller)('products')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _findBySeller_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _uploadProductImages_decorators;
    var _uploadImages_decorators;
    var _deleteImage_decorators;
    var ProductController = _classThis = /** @class */ (function () {
        function ProductController_1(productService) {
            this.productService = (__runInitializers(this, _instanceExtraInitializers), productService);
        }
        ProductController_1.prototype.create = function (createProductDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productService.createWithImageUrls(createProductDto)];
                });
            });
        };
        ProductController_1.prototype.findAll = function (queryDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productService.findAll(queryDto)];
                });
            });
        };
        ProductController_1.prototype.findBySeller = function (sellerId, queryDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productService.findBySeller(sellerId, queryDto)];
                });
            });
        };
        ProductController_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productService.findOne(id)];
                });
            });
        };
        ProductController_1.prototype.update = function (id, updateProductDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.productService.update(id, updateProductDto)];
                });
            });
        };
        ProductController_1.prototype.remove = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productService.remove(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { message: '상품이 성공적으로 삭제되었습니다.' }];
                    }
                });
            });
        };
        ProductController_1.prototype.uploadProductImages = function (files) {
            return __awaiter(this, void 0, void 0, function () {
                var validFiles, imageUrls;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!files || files.length === 0) {
                                throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, '업로드할 파일이 없습니다.');
                            }
                            validFiles = files.filter(function (f) {
                                return f &&
                                    f.size > 0 &&
                                    typeof f.mimetype === 'string' &&
                                    f.mimetype.startsWith('image/');
                            });
                            if (validFiles.length === 0) {
                                throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, '유효한 이미지 파일이 없습니다. (0바이트 또는 이미지 형식 아님)');
                            }
                            return [4 /*yield*/, this.productService.uploadProductImages(validFiles)];
                        case 1:
                            imageUrls = _a.sent();
                            return [2 /*return*/, {
                                    message: '이미지가 성공적으로 업로드되었습니다.',
                                    imageUrls: imageUrls,
                                }];
                    }
                });
            });
        };
        ProductController_1.prototype.uploadImages = function (id, files) {
            return __awaiter(this, void 0, void 0, function () {
                var validFiles, images;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validFiles = files.filter(function (f) {
                                return f &&
                                    f.size > 0 &&
                                    typeof f.mimetype === 'string' &&
                                    f.mimetype.startsWith('image/');
                            });
                            if (validFiles.length === 0) {
                                throw new common_2.BaseError(common_2.ErrorCode.VALIDATION_ERROR, '유효한 이미지 파일이 없습니다. (0바이트 또는 이미지 형식 아님)');
                            }
                            return [4 /*yield*/, this.productService.uploadImages(id, validFiles)];
                        case 1:
                            images = _a.sent();
                            return [2 /*return*/, {
                                    message: '이미지가 성공적으로 업로드되었습니다.',
                                    images: images,
                                }];
                    }
                });
            });
        };
        ProductController_1.prototype.deleteImage = function (productId, imageId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.productService.deleteImage(productId, imageId)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, { message: '이미지가 성공적으로 삭제되었습니다.' }];
                    }
                });
            });
        };
        return ProductController_1;
    }());
    __setFunctionName(_classThis, "ProductController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, swagger_1.ApiOperation)({ summary: '상품 생성 (JSON)' }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: '상품이 성공적으로 생성되었습니다.',
                type: product_entity_1.Product,
            }), (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' })];
        _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: '상품 목록 조회' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: '상품 목록을 성공적으로 조회했습니다.',
            })];
        _findBySeller_decorators = [(0, common_1.Get)('seller/:sellerId'), (0, swagger_1.ApiOperation)({ summary: '판매자별 상품 목록 조회' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: '판매자별 상품 목록을 성공적으로 조회했습니다.',
            })];
        _findOne_decorators = [(0, common_1.Get)(':id'), (0, swagger_1.ApiOperation)({ summary: '상품 상세 조회' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: '상품을 성공적으로 조회했습니다.',
                type: product_entity_1.Product,
            }), (0, swagger_1.ApiResponse)({ status: 404, description: '상품을 찾을 수 없습니다.' })];
        _update_decorators = [(0, common_1.Patch)(':id'), (0, swagger_1.ApiOperation)({ summary: '상품 수정' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: '상품이 성공적으로 수정되었습니다.',
                type: product_entity_1.Product,
            }), (0, swagger_1.ApiResponse)({ status: 404, description: '상품을 찾을 수 없습니다.' })];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, swagger_1.ApiOperation)({ summary: '상품 삭제' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: '상품이 성공적으로 삭제되었습니다.',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: '상품을 찾을 수 없습니다.' })];
        _uploadProductImages_decorators = [(0, common_1.Post)('images'), (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)), (0, swagger_1.ApiOperation)({ summary: '이미지 업로드 (상품 생성 전)' }), (0, swagger_1.ApiConsumes)('multipart/form-data'), (0, swagger_1.ApiBody)({
                schema: {
                    type: 'object',
                    properties: {
                        files: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'binary',
                            },
                        },
                    },
                },
            }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: '이미지가 성공적으로 업로드되었습니다.',
                schema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        imageUrls: {
                            type: 'array',
                            items: { type: 'string' },
                        },
                    },
                },
            }), (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' })];
        _uploadImages_decorators = [(0, common_1.Post)(':id/images'), (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)), (0, swagger_1.ApiOperation)({ summary: '기존 상품에 이미지 추가' }), (0, swagger_1.ApiConsumes)('multipart/form-data'), (0, swagger_1.ApiBody)({
                schema: {
                    type: 'object',
                    properties: {
                        files: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'binary',
                            },
                        },
                    },
                },
            }), (0, swagger_1.ApiResponse)({
                status: 201,
                description: '이미지가 성공적으로 업로드되었습니다.',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: '상품을 찾을 수 없습니다.' })];
        _deleteImage_decorators = [(0, common_1.Delete)(':productId/images/:imageId'), (0, swagger_1.ApiOperation)({ summary: '상품 이미지 삭제' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: '이미지가 성공적으로 삭제되었습니다.',
            }), (0, swagger_1.ApiResponse)({ status: 404, description: '이미지를 찾을 수 없습니다.' })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findBySeller_decorators, { kind: "method", name: "findBySeller", static: false, private: false, access: { has: function (obj) { return "findBySeller" in obj; }, get: function (obj) { return obj.findBySeller; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadProductImages_decorators, { kind: "method", name: "uploadProductImages", static: false, private: false, access: { has: function (obj) { return "uploadProductImages" in obj; }, get: function (obj) { return obj.uploadProductImages; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _uploadImages_decorators, { kind: "method", name: "uploadImages", static: false, private: false, access: { has: function (obj) { return "uploadImages" in obj; }, get: function (obj) { return obj.uploadImages; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteImage_decorators, { kind: "method", name: "deleteImage", static: false, private: false, access: { has: function (obj) { return "deleteImage" in obj; }, get: function (obj) { return obj.deleteImage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductController = _classThis;
}();
exports.ProductController = ProductController;
