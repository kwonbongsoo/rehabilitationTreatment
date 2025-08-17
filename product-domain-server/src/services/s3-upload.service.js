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
exports.S3UploadService = void 0;
var common_1 = require("@nestjs/common");
var client_s3_1 = require("@aws-sdk/client-s3");
var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
var uuid_1 = require("uuid");
var aws_config_1 = require("@config/aws.config");
var S3UploadService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var S3UploadService = _classThis = /** @class */ (function () {
        function S3UploadService_1(configService) {
            var _a;
            this.configService = configService;
            var awsConfig = (0, aws_config_1.getAwsConfig)(configService);
            this.s3Client = new client_s3_1.S3Client({
                region: awsConfig.region,
                credentials: {
                    accessKeyId: awsConfig.accessKeyId,
                    secretAccessKey: awsConfig.secretAccessKey,
                },
            });
            this.bucketName = awsConfig.bucketName;
            this.awsRegion = awsConfig.region;
            this.cdnDomain = (_a = this.configService
                .get('CDN_DOMAIN')) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, ''); // trailing slash 제거
            this.allowedFileTypes = configService
                .get('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,webp,gif,avif')
                .split(',');
            this.maxFileSize = configService.get('MAX_FILE_SIZE', 5242880); // 5MB
        }
        S3UploadService_1.prototype.uploadFile = function (file_1) {
            return __awaiter(this, arguments, void 0, function (file, folder) {
                var fileExtension, fileName, key, command, url, error_1;
                if (folder === void 0) { folder = 'image/products'; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.validateFile(file);
                            fileExtension = this.getFileExtension(file.originalname);
                            fileName = "".concat((0, uuid_1.v4)(), ".").concat(fileExtension);
                            key = "".concat(folder, "/").concat(fileName);
                            // 메모리 스토리지 아닐 수 있는 상황 대비: buffer가 없거나 size가 0이면 에러 처리
                            if (!file.buffer || file.size === 0) {
                                throw new common_1.BadRequestException('유효하지 않은 파일 데이터입니다.(빈 파일)');
                            }
                            command = new client_s3_1.PutObjectCommand({
                                Bucket: this.bucketName,
                                Key: key,
                                Body: file.buffer,
                                ContentType: file.mimetype,
                                ContentDisposition: 'inline',
                                CacheControl: 'max-age=31536000', // 1 year
                                ACL: 'public-read',
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.s3Client.send(command)];
                        case 2:
                            _a.sent();
                            url = this.buildPublicUrl(key);
                            return [2 /*return*/, {
                                    key: key,
                                    url: url,
                                    originalName: file.originalname,
                                    size: file.size,
                                    mimeType: file.mimetype,
                                }];
                        case 3:
                            error_1 = _a.sent();
                            throw new common_1.BadRequestException("\uD30C\uC77C \uC5C5\uB85C\uB4DC \uC2E4\uD328: ".concat(error_1.message));
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        S3UploadService_1.prototype.uploadMultipleFiles = function (files_1) {
            return __awaiter(this, arguments, void 0, function (files, folder) {
                var uploadPromises;
                var _this = this;
                if (folder === void 0) { folder = 'products'; }
                return __generator(this, function (_a) {
                    uploadPromises = files.map(function (file) { return _this.uploadFile(file, folder); });
                    return [2 /*return*/, Promise.all(uploadPromises)];
                });
            });
        };
        S3UploadService_1.prototype.deleteFile = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var command, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            command = new client_s3_1.DeleteObjectCommand({
                                Bucket: this.bucketName,
                                Key: key,
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.s3Client.send(command)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            throw new common_1.BadRequestException("\uD30C\uC77C \uC0AD\uC81C \uC2E4\uD328: ".concat(error_2.message));
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        S3UploadService_1.prototype.getPresignedUrl = function (key_1) {
            return __awaiter(this, arguments, void 0, function (key, expiresIn) {
                var command;
                if (expiresIn === void 0) { expiresIn = 3600; }
                return __generator(this, function (_a) {
                    command = new client_s3_1.PutObjectCommand({
                        Bucket: this.bucketName,
                        Key: key,
                    });
                    return [2 /*return*/, (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: expiresIn })];
                });
            });
        };
        S3UploadService_1.prototype.validateFile = function (file) {
            if (!file) {
                throw new common_1.BadRequestException('파일이 제공되지 않았습니다.');
            }
            if (!file.mimetype || !file.mimetype.startsWith('image/')) {
                throw new common_1.BadRequestException('이미지 파일만 업로드할 수 있습니다.');
            }
            if (!file.buffer || file.size === 0) {
                throw new common_1.BadRequestException('빈 파일은 업로드할 수 없습니다.');
            }
            if (file.size > this.maxFileSize) {
                throw new common_1.BadRequestException("\uD30C\uC77C \uD06C\uAE30\uAC00 \uB108\uBB34 \uD07D\uB2C8\uB2E4. \uCD5C\uB300 ".concat(this.maxFileSize / 1024 / 1024, "MB\uAE4C\uC9C0 \uD5C8\uC6A9\uB429\uB2C8\uB2E4."));
            }
            var fileExtension = this.getFileExtension(file.originalname);
            if (!this.allowedFileTypes.includes(fileExtension.toLowerCase())) {
                throw new common_1.BadRequestException("\uD5C8\uC6A9\uB418\uC9C0 \uC54A\uB294 \uD30C\uC77C \uD615\uC2DD\uC785\uB2C8\uB2E4. \uD5C8\uC6A9\uB418\uB294 \uD615\uC2DD: ".concat(this.allowedFileTypes.join(', ')));
            }
        };
        S3UploadService_1.prototype.getFileExtension = function (fileName) {
            return fileName.split('.').pop() || '';
        };
        S3UploadService_1.prototype.getFileUrl = function (key) {
            return this.buildPublicUrl(key);
        };
        S3UploadService_1.prototype.buildPublicUrl = function (key) {
            if (this.cdnDomain) {
                return "".concat(this.cdnDomain, "/").concat(key);
            }
            return "https://".concat(this.bucketName, ".s3.").concat(this.awsRegion, ".amazonaws.com/").concat(key);
        };
        return S3UploadService_1;
    }());
    __setFunctionName(_classThis, "S3UploadService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        S3UploadService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return S3UploadService = _classThis;
}();
exports.S3UploadService = S3UploadService;
