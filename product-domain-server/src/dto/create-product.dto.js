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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductDto = exports.CreateProductOptionDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var swagger_1 = require("@nestjs/swagger");
var CreateProductOptionDto = function () {
    var _a;
    var _optionType_decorators;
    var _optionType_initializers = [];
    var _optionType_extraInitializers = [];
    var _optionName_decorators;
    var _optionName_initializers = [];
    var _optionName_extraInitializers = [];
    var _optionValue_decorators;
    var _optionValue_initializers = [];
    var _optionValue_extraInitializers = [];
    var _additionalPrice_decorators;
    var _additionalPrice_initializers = [];
    var _additionalPrice_extraInitializers = [];
    var _stock_decorators;
    var _stock_initializers = [];
    var _stock_extraInitializers = [];
    var _sku_decorators;
    var _sku_initializers = [];
    var _sku_extraInitializers = [];
    var _sortOrder_decorators;
    var _sortOrder_initializers = [];
    var _sortOrder_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateProductOptionDto() {
                this.optionType = __runInitializers(this, _optionType_initializers, void 0);
                this.optionName = (__runInitializers(this, _optionType_extraInitializers), __runInitializers(this, _optionName_initializers, void 0));
                this.optionValue = (__runInitializers(this, _optionName_extraInitializers), __runInitializers(this, _optionValue_initializers, void 0));
                this.additionalPrice = (__runInitializers(this, _optionValue_extraInitializers), __runInitializers(this, _additionalPrice_initializers, void 0));
                this.stock = (__runInitializers(this, _additionalPrice_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
                this.sku = (__runInitializers(this, _stock_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
                this.sortOrder = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
                __runInitializers(this, _sortOrder_extraInitializers);
            }
            return CreateProductOptionDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _optionType_decorators = [(0, swagger_1.ApiProperty)({ description: '옵션 타입', example: 'color' }), (0, class_validator_1.IsString)()];
            _optionName_decorators = [(0, swagger_1.ApiProperty)({ description: '옵션 이름', example: '색상' }), (0, class_validator_1.IsString)()];
            _optionValue_decorators = [(0, swagger_1.ApiProperty)({ description: '옵션 값', example: '블랙' }), (0, class_validator_1.IsString)()];
            _additionalPrice_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '추가 가격', example: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _stock_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '재고', example: 100 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _sku_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'SKU' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _sortOrder_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '정렬 순서', example: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            __esDecorate(null, null, _optionType_decorators, { kind: "field", name: "optionType", static: false, private: false, access: { has: function (obj) { return "optionType" in obj; }, get: function (obj) { return obj.optionType; }, set: function (obj, value) { obj.optionType = value; } }, metadata: _metadata }, _optionType_initializers, _optionType_extraInitializers);
            __esDecorate(null, null, _optionName_decorators, { kind: "field", name: "optionName", static: false, private: false, access: { has: function (obj) { return "optionName" in obj; }, get: function (obj) { return obj.optionName; }, set: function (obj, value) { obj.optionName = value; } }, metadata: _metadata }, _optionName_initializers, _optionName_extraInitializers);
            __esDecorate(null, null, _optionValue_decorators, { kind: "field", name: "optionValue", static: false, private: false, access: { has: function (obj) { return "optionValue" in obj; }, get: function (obj) { return obj.optionValue; }, set: function (obj, value) { obj.optionValue = value; } }, metadata: _metadata }, _optionValue_initializers, _optionValue_extraInitializers);
            __esDecorate(null, null, _additionalPrice_decorators, { kind: "field", name: "additionalPrice", static: false, private: false, access: { has: function (obj) { return "additionalPrice" in obj; }, get: function (obj) { return obj.additionalPrice; }, set: function (obj, value) { obj.additionalPrice = value; } }, metadata: _metadata }, _additionalPrice_initializers, _additionalPrice_extraInitializers);
            __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: function (obj) { return "stock" in obj; }, get: function (obj) { return obj.stock; }, set: function (obj, value) { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: function (obj) { return "sku" in obj; }, get: function (obj) { return obj.sku; }, set: function (obj, value) { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: function (obj) { return "sortOrder" in obj; }, get: function (obj) { return obj.sortOrder; }, set: function (obj, value) { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateProductOptionDto = CreateProductOptionDto;
var CreateProductDto = function () {
    var _a;
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var _originalPrice_decorators;
    var _originalPrice_initializers = [];
    var _originalPrice_extraInitializers = [];
    var _categoryId_decorators;
    var _categoryId_initializers = [];
    var _categoryId_extraInitializers = [];
    var _sellerId_decorators;
    var _sellerId_initializers = [];
    var _sellerId_extraInitializers = [];
    var _mainImage_decorators;
    var _mainImage_initializers = [];
    var _mainImage_extraInitializers = [];
    var _rating_decorators;
    var _rating_initializers = [];
    var _rating_extraInitializers = [];
    var _averageRating_decorators;
    var _averageRating_initializers = [];
    var _averageRating_extraInitializers = [];
    var _reviewCount_decorators;
    var _reviewCount_initializers = [];
    var _reviewCount_extraInitializers = [];
    var _isNew_decorators;
    var _isNew_initializers = [];
    var _isNew_extraInitializers = [];
    var _isFeatured_decorators;
    var _isFeatured_initializers = [];
    var _isFeatured_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _discountPercentage_decorators;
    var _discountPercentage_initializers = [];
    var _discountPercentage_extraInitializers = [];
    var _stock_decorators;
    var _stock_initializers = [];
    var _stock_extraInitializers = [];
    var _sku_decorators;
    var _sku_initializers = [];
    var _sku_extraInitializers = [];
    var _weight_decorators;
    var _weight_initializers = [];
    var _weight_extraInitializers = [];
    var _dimensions_decorators;
    var _dimensions_initializers = [];
    var _dimensions_extraInitializers = [];
    var _specifications_decorators;
    var _specifications_initializers = [];
    var _specifications_extraInitializers = [];
    var _options_decorators;
    var _options_initializers = [];
    var _options_extraInitializers = [];
    var _imageUrls_decorators;
    var _imageUrls_initializers = [];
    var _imageUrls_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateProductDto() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.description = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.price = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.originalPrice = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _originalPrice_initializers, void 0));
                this.categoryId = (__runInitializers(this, _originalPrice_extraInitializers), __runInitializers(this, _categoryId_initializers, void 0));
                this.sellerId = (__runInitializers(this, _categoryId_extraInitializers), __runInitializers(this, _sellerId_initializers, void 0));
                this.mainImage = (__runInitializers(this, _sellerId_extraInitializers), __runInitializers(this, _mainImage_initializers, void 0));
                this.rating = (__runInitializers(this, _mainImage_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
                this.averageRating = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _averageRating_initializers, void 0));
                this.reviewCount = (__runInitializers(this, _averageRating_extraInitializers), __runInitializers(this, _reviewCount_initializers, void 0));
                this.isNew = (__runInitializers(this, _reviewCount_extraInitializers), __runInitializers(this, _isNew_initializers, void 0));
                this.isFeatured = (__runInitializers(this, _isNew_extraInitializers), __runInitializers(this, _isFeatured_initializers, void 0));
                this.isActive = (__runInitializers(this, _isFeatured_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
                this.discountPercentage = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _discountPercentage_initializers, void 0));
                this.stock = (__runInitializers(this, _discountPercentage_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
                this.sku = (__runInitializers(this, _stock_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
                this.weight = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _weight_initializers, void 0));
                this.dimensions = (__runInitializers(this, _weight_extraInitializers), __runInitializers(this, _dimensions_initializers, void 0));
                this.specifications = (__runInitializers(this, _dimensions_extraInitializers), __runInitializers(this, _specifications_initializers, void 0));
                this.options = (__runInitializers(this, _specifications_extraInitializers), __runInitializers(this, _options_initializers, void 0));
                this.imageUrls = (__runInitializers(this, _options_extraInitializers), __runInitializers(this, _imageUrls_initializers, void 0));
                __runInitializers(this, _imageUrls_extraInitializers);
            }
            return CreateProductDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, swagger_1.ApiProperty)({ description: '상품명', example: '심플 티셔츠' }), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, swagger_1.ApiProperty)({
                    description: '상품 설명',
                    example: '편안한 착용감과 심플한 디자인이 매력적인 기본 티셔츠입니다.',
                }), (0, class_validator_1.IsString)()];
            _price_decorators = [(0, swagger_1.ApiProperty)({ description: '가격', example: 29000 }), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        var parsed = parseFloat(value);
                        return isNaN(parsed) ? value : parsed;
                    }
                    return value;
                })];
            _originalPrice_decorators = [(0, swagger_1.ApiProperty)({ description: '원가', example: 29000 }), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        var parsed = parseFloat(value);
                        return isNaN(parsed) ? value : parsed;
                    }
                    return value;
                })];
            _categoryId_decorators = [(0, swagger_1.ApiProperty)({ description: '카테고리 ID', example: 1 }), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        var parsed = parseFloat(value);
                        return isNaN(parsed) ? value : parsed;
                    }
                    return value;
                })];
            _sellerId_decorators = [(0, swagger_1.ApiProperty)({ description: '판매자 ID', example: 'seller123' }), (0, class_validator_1.IsString)()];
            _mainImage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '메인 이미지 URL' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _rating_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '평점', example: 4.5 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _averageRating_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '평균 평점', example: 4.5 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _reviewCount_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '리뷰 수', example: 123 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _isNew_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '신상품 여부', example: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)(), (0, class_transformer_1.Type)(function () { return Boolean; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        return value === 'true' || value === '1';
                    }
                    return Boolean(value);
                })];
            _isFeatured_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '추천 상품 여부', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)(), (0, class_transformer_1.Type)(function () { return Boolean; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        return value === 'true' || value === '1';
                    }
                    return Boolean(value);
                })];
            _isActive_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '활성화 상태', example: true }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)(), (0, class_transformer_1.Type)(function () { return Boolean; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        return value === 'true' || value === '1';
                    }
                    return Boolean(value);
                })];
            _discountPercentage_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '할인율', example: 0 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _stock_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '재고', example: 100 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _sku_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: 'SKU' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _weight_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '무게', example: 0.5 }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    return (value ? parseFloat(value) : undefined);
                })];
            _dimensions_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: '치수',
                    example: { length: 10, width: 20, height: 30 },
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)(), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        try {
                            return JSON.parse(value);
                        }
                        catch (_c) {
                            return undefined;
                        }
                    }
                    return value;
                })];
            _specifications_decorators = [(0, swagger_1.ApiPropertyOptional)({ description: '상품 스펙' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsObject)(), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        try {
                            return JSON.parse(value);
                        }
                        catch (_c) {
                            return undefined;
                        }
                    }
                    return value;
                })];
            _options_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: '상품 옵션',
                    type: [CreateProductOptionDto],
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.ValidateNested)({ each: true }), (0, class_transformer_1.Type)(function () { return CreateProductOptionDto; }), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value === 'string') {
                        try {
                            return JSON.parse(value);
                        }
                        catch (_c) {
                            return undefined;
                        }
                    }
                    return value;
                })];
            _imageUrls_decorators = [(0, swagger_1.ApiPropertyOptional)({
                    description: '이미지 URL 배열 (사전 업로드된 이미지)',
                    example: [
                        'https://s3.amazonaws.com/bucket/image1.jpg',
                        'https://s3.amazonaws.com/bucket/image2.jpg',
                    ],
                }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _originalPrice_decorators, { kind: "field", name: "originalPrice", static: false, private: false, access: { has: function (obj) { return "originalPrice" in obj; }, get: function (obj) { return obj.originalPrice; }, set: function (obj, value) { obj.originalPrice = value; } }, metadata: _metadata }, _originalPrice_initializers, _originalPrice_extraInitializers);
            __esDecorate(null, null, _categoryId_decorators, { kind: "field", name: "categoryId", static: false, private: false, access: { has: function (obj) { return "categoryId" in obj; }, get: function (obj) { return obj.categoryId; }, set: function (obj, value) { obj.categoryId = value; } }, metadata: _metadata }, _categoryId_initializers, _categoryId_extraInitializers);
            __esDecorate(null, null, _sellerId_decorators, { kind: "field", name: "sellerId", static: false, private: false, access: { has: function (obj) { return "sellerId" in obj; }, get: function (obj) { return obj.sellerId; }, set: function (obj, value) { obj.sellerId = value; } }, metadata: _metadata }, _sellerId_initializers, _sellerId_extraInitializers);
            __esDecorate(null, null, _mainImage_decorators, { kind: "field", name: "mainImage", static: false, private: false, access: { has: function (obj) { return "mainImage" in obj; }, get: function (obj) { return obj.mainImage; }, set: function (obj, value) { obj.mainImage = value; } }, metadata: _metadata }, _mainImage_initializers, _mainImage_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: function (obj) { return "rating" in obj; }, get: function (obj) { return obj.rating; }, set: function (obj, value) { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _averageRating_decorators, { kind: "field", name: "averageRating", static: false, private: false, access: { has: function (obj) { return "averageRating" in obj; }, get: function (obj) { return obj.averageRating; }, set: function (obj, value) { obj.averageRating = value; } }, metadata: _metadata }, _averageRating_initializers, _averageRating_extraInitializers);
            __esDecorate(null, null, _reviewCount_decorators, { kind: "field", name: "reviewCount", static: false, private: false, access: { has: function (obj) { return "reviewCount" in obj; }, get: function (obj) { return obj.reviewCount; }, set: function (obj, value) { obj.reviewCount = value; } }, metadata: _metadata }, _reviewCount_initializers, _reviewCount_extraInitializers);
            __esDecorate(null, null, _isNew_decorators, { kind: "field", name: "isNew", static: false, private: false, access: { has: function (obj) { return "isNew" in obj; }, get: function (obj) { return obj.isNew; }, set: function (obj, value) { obj.isNew = value; } }, metadata: _metadata }, _isNew_initializers, _isNew_extraInitializers);
            __esDecorate(null, null, _isFeatured_decorators, { kind: "field", name: "isFeatured", static: false, private: false, access: { has: function (obj) { return "isFeatured" in obj; }, get: function (obj) { return obj.isFeatured; }, set: function (obj, value) { obj.isFeatured = value; } }, metadata: _metadata }, _isFeatured_initializers, _isFeatured_extraInitializers);
            __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
            __esDecorate(null, null, _discountPercentage_decorators, { kind: "field", name: "discountPercentage", static: false, private: false, access: { has: function (obj) { return "discountPercentage" in obj; }, get: function (obj) { return obj.discountPercentage; }, set: function (obj, value) { obj.discountPercentage = value; } }, metadata: _metadata }, _discountPercentage_initializers, _discountPercentage_extraInitializers);
            __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: function (obj) { return "stock" in obj; }, get: function (obj) { return obj.stock; }, set: function (obj, value) { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
            __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: function (obj) { return "sku" in obj; }, get: function (obj) { return obj.sku; }, set: function (obj, value) { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
            __esDecorate(null, null, _weight_decorators, { kind: "field", name: "weight", static: false, private: false, access: { has: function (obj) { return "weight" in obj; }, get: function (obj) { return obj.weight; }, set: function (obj, value) { obj.weight = value; } }, metadata: _metadata }, _weight_initializers, _weight_extraInitializers);
            __esDecorate(null, null, _dimensions_decorators, { kind: "field", name: "dimensions", static: false, private: false, access: { has: function (obj) { return "dimensions" in obj; }, get: function (obj) { return obj.dimensions; }, set: function (obj, value) { obj.dimensions = value; } }, metadata: _metadata }, _dimensions_initializers, _dimensions_extraInitializers);
            __esDecorate(null, null, _specifications_decorators, { kind: "field", name: "specifications", static: false, private: false, access: { has: function (obj) { return "specifications" in obj; }, get: function (obj) { return obj.specifications; }, set: function (obj, value) { obj.specifications = value; } }, metadata: _metadata }, _specifications_initializers, _specifications_extraInitializers);
            __esDecorate(null, null, _options_decorators, { kind: "field", name: "options", static: false, private: false, access: { has: function (obj) { return "options" in obj; }, get: function (obj) { return obj.options; }, set: function (obj, value) { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            __esDecorate(null, null, _imageUrls_decorators, { kind: "field", name: "imageUrls", static: false, private: false, access: { has: function (obj) { return "imageUrls" in obj; }, get: function (obj) { return obj.imageUrls; }, set: function (obj, value) { obj.imageUrls = value; } }, metadata: _metadata }, _imageUrls_initializers, _imageUrls_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateProductDto = CreateProductDto;
