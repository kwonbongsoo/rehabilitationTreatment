import { ConfigService } from '@nestjs/config';

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

export const getAwsConfig = (configService: ConfigService): AwsConfig => ({
  accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
  secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
  region: configService.get<string>('AWS_REGION', 'ap-northeast-2'),
  bucketName: configService.get<string>('S3_BUCKET_NAME'),
});