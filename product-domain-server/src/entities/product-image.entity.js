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
exports.ProductImage = void 0;
var typeorm_1 = require("typeorm");
var product_entity_1 = require("./product.entity");
var ProductImage = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('product_images')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _originalUrl_decorators;
    var _originalUrl_initializers = [];
    var _originalUrl_extraInitializers = [];
    var _thumbnailUrl_decorators;
    var _thumbnailUrl_initializers = [];
    var _thumbnailUrl_extraInitializers = [];
    var _altText_decorators;
    var _altText_initializers = [];
    var _altText_extraInitializers = [];
    var _isMain_decorators;
    var _isMain_initializers = [];
    var _isMain_extraInitializers = [];
    var _sortOrder_decorators;
    var _sortOrder_initializers = [];
    var _sortOrder_extraInitializers = [];
    var _fileName_decorators;
    var _fileName_initializers = [];
    var _fileName_extraInitializers = [];
    var _fileType_decorators;
    var _fileType_initializers = [];
    var _fileType_extraInitializers = [];
    var _fileSize_decorators;
    var _fileSize_initializers = [];
    var _fileSize_extraInitializers = [];
    var _width_decorators;
    var _width_initializers = [];
    var _width_extraInitializers = [];
    var _height_decorators;
    var _height_initializers = [];
    var _height_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _product_decorators;
    var _product_initializers = [];
    var _product_extraInitializers = [];
    var ProductImage = _classThis = /** @class */ (function () {
        function ProductImage_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.productId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
            this.imageUrl = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
            this.originalUrl = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _originalUrl_initializers, void 0));
            this.thumbnailUrl = (__runInitializers(this, _originalUrl_extraInitializers), __runInitializers(this, _thumbnailUrl_initializers, void 0));
            this.altText = (__runInitializers(this, _thumbnailUrl_extraInitializers), __runInitializers(this, _altText_initializers, void 0));
            this.isMain = (__runInitializers(this, _altText_extraInitializers), __runInitializers(this, _isMain_initializers, void 0));
            this.sortOrder = (__runInitializers(this, _isMain_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
            this.fileName = (__runInitializers(this, _sortOrder_extraInitializers), __runInitializers(this, _fileName_initializers, void 0));
            this.fileType = (__runInitializers(this, _fileName_extraInitializers), __runInitializers(this, _fileType_initializers, void 0));
            this.fileSize = (__runInitializers(this, _fileType_extraInitializers), __runInitializers(this, _fileSize_initializers, void 0));
            this.width = (__runInitializers(this, _fileSize_extraInitializers), __runInitializers(this, _width_initializers, void 0));
            this.height = (__runInitializers(this, _width_extraInitializers), __runInitializers(this, _height_initializers, void 0));
            this.createdAt = (__runInitializers(this, _height_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.product = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _product_initializers, void 0));
            __runInitializers(this, _product_extraInitializers);
        }
        return ProductImage_1;
    }());
    __setFunctionName(_classThis, "ProductImage");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _productId_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
        _imageUrl_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 500 })];
        _originalUrl_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true })];
        _thumbnailUrl_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true })];
        _altText_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true })];
        _isMain_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: false })];
        _sortOrder_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _fileName_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true })];
        _fileType_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true })];
        _fileSize_decorators = [(0, typeorm_1.Column)({ type: 'int', nullable: true })];
        _width_decorators = [(0, typeorm_1.Column)({ type: 'int', nullable: true })];
        _height_decorators = [(0, typeorm_1.Column)({ type: 'int', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _product_decorators = [(0, typeorm_1.ManyToOne)(function () { return product_entity_1.Product; }, function (product) { return product.images; }, {
                onDelete: 'CASCADE',
            }), (0, typeorm_1.JoinColumn)({ name: 'productId' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
        __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
        __esDecorate(null, null, _originalUrl_decorators, { kind: "field", name: "originalUrl", static: false, private: false, access: { has: function (obj) { return "originalUrl" in obj; }, get: function (obj) { return obj.originalUrl; }, set: function (obj, value) { obj.originalUrl = value; } }, metadata: _metadata }, _originalUrl_initializers, _originalUrl_extraInitializers);
        __esDecorate(null, null, _thumbnailUrl_decorators, { kind: "field", name: "thumbnailUrl", static: false, private: false, access: { has: function (obj) { return "thumbnailUrl" in obj; }, get: function (obj) { return obj.thumbnailUrl; }, set: function (obj, value) { obj.thumbnailUrl = value; } }, metadata: _metadata }, _thumbnailUrl_initializers, _thumbnailUrl_extraInitializers);
        __esDecorate(null, null, _altText_decorators, { kind: "field", name: "altText", static: false, private: false, access: { has: function (obj) { return "altText" in obj; }, get: function (obj) { return obj.altText; }, set: function (obj, value) { obj.altText = value; } }, metadata: _metadata }, _altText_initializers, _altText_extraInitializers);
        __esDecorate(null, null, _isMain_decorators, { kind: "field", name: "isMain", static: false, private: false, access: { has: function (obj) { return "isMain" in obj; }, get: function (obj) { return obj.isMain; }, set: function (obj, value) { obj.isMain = value; } }, metadata: _metadata }, _isMain_initializers, _isMain_extraInitializers);
        __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: function (obj) { return "sortOrder" in obj; }, get: function (obj) { return obj.sortOrder; }, set: function (obj, value) { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
        __esDecorate(null, null, _fileName_decorators, { kind: "field", name: "fileName", static: false, private: false, access: { has: function (obj) { return "fileName" in obj; }, get: function (obj) { return obj.fileName; }, set: function (obj, value) { obj.fileName = value; } }, metadata: _metadata }, _fileName_initializers, _fileName_extraInitializers);
        __esDecorate(null, null, _fileType_decorators, { kind: "field", name: "fileType", static: false, private: false, access: { has: function (obj) { return "fileType" in obj; }, get: function (obj) { return obj.fileType; }, set: function (obj, value) { obj.fileType = value; } }, metadata: _metadata }, _fileType_initializers, _fileType_extraInitializers);
        __esDecorate(null, null, _fileSize_decorators, { kind: "field", name: "fileSize", static: false, private: false, access: { has: function (obj) { return "fileSize" in obj; }, get: function (obj) { return obj.fileSize; }, set: function (obj, value) { obj.fileSize = value; } }, metadata: _metadata }, _fileSize_initializers, _fileSize_extraInitializers);
        __esDecorate(null, null, _width_decorators, { kind: "field", name: "width", static: false, private: false, access: { has: function (obj) { return "width" in obj; }, get: function (obj) { return obj.width; }, set: function (obj, value) { obj.width = value; } }, metadata: _metadata }, _width_initializers, _width_extraInitializers);
        __esDecorate(null, null, _height_decorators, { kind: "field", name: "height", static: false, private: false, access: { has: function (obj) { return "height" in obj; }, get: function (obj) { return obj.height; }, set: function (obj, value) { obj.height = value; } }, metadata: _metadata }, _height_initializers, _height_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _product_decorators, { kind: "field", name: "product", static: false, private: false, access: { has: function (obj) { return "product" in obj; }, get: function (obj) { return obj.product; }, set: function (obj, value) { obj.product = value; } }, metadata: _metadata }, _product_initializers, _product_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductImage = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductImage = _classThis;
}();
exports.ProductImage = ProductImage;
