"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwsConfig = void 0;
var getAwsConfig = function (configService) { return ({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION', 'ap-northeast-2'),
    bucketName: configService.get('S3_BUCKET_NAME'),
}); };
exports.getAwsConfig = getAwsConfig;
