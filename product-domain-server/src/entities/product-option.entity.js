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
exports.ProductOption = void 0;
var typeorm_1 = require("typeorm");
var product_entity_1 = require("./product.entity");
var ProductOption = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('product_options')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
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
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _sortOrder_decorators;
    var _sortOrder_initializers = [];
    var _sortOrder_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _product_decorators;
    var _product_initializers = [];
    var _product_extraInitializers = [];
    var ProductOption = _classThis = /** @class */ (function () {
        function ProductOption_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.productId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
            this.optionType = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _optionType_initializers, void 0)); // 'color', 'size', 'material' 등
            this.optionName = (__runInitializers(this, _optionType_extraInitializers), __runInitializers(this, _optionName_initializers, void 0));
            this.optionValue = (__runInitializers(this, _optionName_extraInitializers), __runInitializers(this, _optionValue_initializers, void 0));
            this.additionalPrice = (__runInitializers(this, _optionValue_extraInitializers), __runInitializers(this, _additionalPrice_initializers, void 0));
            this.stock = (__runInitializers(this, _additionalPrice_extraInitializers), __runInitializers(this, _stock_initializers, void 0));
            this.sku = (__runInitializers(this, _stock_extraInitializers), __runInitializers(this, _sku_initializers, void 0));
            this.isActive = (__runInitializers(this, _sku_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.sortOrder = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _sortOrder_initializers, void 0));
            this.createdAt = (__runInitializers(this, _sortOrder_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.product = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _product_initializers, void 0));
            __runInitializers(this, _product_extraInitializers);
        }
        return ProductOption_1;
    }());
    __setFunctionName(_classThis, "ProductOption");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _productId_decorators = [(0, typeorm_1.Column)({ type: 'int' })];
        _optionType_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 100 })];
        _optionName_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 100 })];
        _optionValue_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 100 })];
        _additionalPrice_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 })];
        _stock_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _sku_decorators = [(0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true })];
        _isActive_decorators = [(0, typeorm_1.Column)({ type: 'boolean', default: true })];
        _sortOrder_decorators = [(0, typeorm_1.Column)({ type: 'int', default: 0 })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _product_decorators = [(0, typeorm_1.ManyToOne)(function () { return product_entity_1.Product; }, function (product) { return product.options; }, {
                onDelete: 'CASCADE',
            }), (0, typeorm_1.JoinColumn)({ name: 'productId' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
        __esDecorate(null, null, _optionType_decorators, { kind: "field", name: "optionType", static: false, private: false, access: { has: function (obj) { return "optionType" in obj; }, get: function (obj) { return obj.optionType; }, set: function (obj, value) { obj.optionType = value; } }, metadata: _metadata }, _optionType_initializers, _optionType_extraInitializers);
        __esDecorate(null, null, _optionName_decorators, { kind: "field", name: "optionName", static: false, private: false, access: { has: function (obj) { return "optionName" in obj; }, get: function (obj) { return obj.optionName; }, set: function (obj, value) { obj.optionName = value; } }, metadata: _metadata }, _optionName_initializers, _optionName_extraInitializers);
        __esDecorate(null, null, _optionValue_decorators, { kind: "field", name: "optionValue", static: false, private: false, access: { has: function (obj) { return "optionValue" in obj; }, get: function (obj) { return obj.optionValue; }, set: function (obj, value) { obj.optionValue = value; } }, metadata: _metadata }, _optionValue_initializers, _optionValue_extraInitializers);
        __esDecorate(null, null, _additionalPrice_decorators, { kind: "field", name: "additionalPrice", static: false, private: false, access: { has: function (obj) { return "additionalPrice" in obj; }, get: function (obj) { return obj.additionalPrice; }, set: function (obj, value) { obj.additionalPrice = value; } }, metadata: _metadata }, _additionalPrice_initializers, _additionalPrice_extraInitializers);
        __esDecorate(null, null, _stock_decorators, { kind: "field", name: "stock", static: false, private: false, access: { has: function (obj) { return "stock" in obj; }, get: function (obj) { return obj.stock; }, set: function (obj, value) { obj.stock = value; } }, metadata: _metadata }, _stock_initializers, _stock_extraInitializers);
        __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: function (obj) { return "sku" in obj; }, get: function (obj) { return obj.sku; }, set: function (obj, value) { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _sortOrder_decorators, { kind: "field", name: "sortOrder", static: false, private: false, access: { has: function (obj) { return "sortOrder" in obj; }, get: function (obj) { return obj.sortOrder; }, set: function (obj, value) { obj.sortOrder = value; } }, metadata: _metadata }, _sortOrder_initializers, _sortOrder_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _product_decorators, { kind: "field", name: "product", static: false, private: false, access: { has: function (obj) { return "product" in obj; }, get: function (obj) { return obj.product; }, set: function (obj, value) { obj.product = value; } }, metadata: _metadata }, _product_initializers, _product_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProductOption = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProductOption = _classThis;
}();
exports.ProductOption = ProductOption;
