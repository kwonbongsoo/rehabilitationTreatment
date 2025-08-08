import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { getAwsConfig } from '@config/aws.config';

export interface UploadResult {
  key: string;
  url: string;
  thumbnailUrl?: string;
  originalName: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

@Injectable()
export class S3UploadService {
  private s3Client: S3Client;
  private bucketName: string;
  private allowedFileTypes: string[];
  private maxFileSize: number;
  private cdnDomain?: string;
  private awsRegion: string;

  constructor(private configService: ConfigService) {
    const awsConfig = getAwsConfig(configService);

    this.s3Client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });

    this.bucketName = awsConfig.bucketName;
    this.awsRegion = awsConfig.region;
    this.cdnDomain = this.configService
      .get<string>('CDN_DOMAIN')
      ?.replace(/\/$/, ''); // trailing slash 제거
    this.allowedFileTypes = configService
      .get<string>('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,webp,gif,avif')
      .split(',');
    this.maxFileSize = configService.get<number>('MAX_FILE_SIZE', 5242880); // 5MB
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'image/products',
  ): Promise<UploadResult> {
    this.validateFile(file);

    const fileExtension = this.getFileExtension(file.originalname);
    const fileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${fileName}`;

    // 메모리 스토리지 아닐 수 있는 상황 대비: buffer가 없거나 size가 0이면 에러 처리
    if (!file.buffer || file.size === 0) {
      throw new BadRequestException(
        '유효하지 않은 파일 데이터입니다.(빈 파일)',
      );
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
      CacheControl: 'max-age=31536000', // 1 year
      ACL: 'public-read',
    });

    try {
      await this.s3Client.send(command);

      const url = this.buildPublicUrl(key);

      return {
        key,
        url,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException(`파일 업로드 실패: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'products',
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new BadRequestException(`파일 삭제 실패: ${error.message}`);
    }
  }

  async getPresignedUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('파일이 제공되지 않았습니다.');
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('이미지 파일만 업로드할 수 있습니다.');
    }

    if (!file.buffer || file.size === 0) {
      throw new BadRequestException('빈 파일은 업로드할 수 없습니다.');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `파일 크기가 너무 큽니다. 최대 ${this.maxFileSize / 1024 / 1024}MB까지 허용됩니다.`,
      );
    }

    const fileExtension = this.getFileExtension(file.originalname);
    if (!this.allowedFileTypes.includes(fileExtension.toLowerCase())) {
      throw new BadRequestException(
        `허용되지 않는 파일 형식입니다. 허용되는 형식: ${this.allowedFileTypes.join(', ')}`,
      );
    }
  }

  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || '';
  }

  getFileUrl(key: string): string {
    return this.buildPublicUrl(key);
  }

  private buildPublicUrl(key: string): string {
    if (this.cdnDomain) {
      return `${this.cdnDomain}/${key}`;
    }
    return `https://${this.bucketName}.s3.${this.awsRegion}.amazonaws.com/${key}`;
  }
}
