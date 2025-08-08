import { FastifyRequest } from 'fastify';
import { BaseError, ErrorCode, ValidationError } from '@ecommerce/common';

interface ParsedMultipartData {
  fields: Record<string, string>;
  files: File[];
}

interface MultipartParserConfig {
  maxFileSize: number;
  maxFileCount: number;
  allowedMimeTypes: readonly string[];
  requiredFields: readonly string[];
}

export class MultipartParser {
  private readonly config: MultipartParserConfig;

  constructor(config: MultipartParserConfig) {
    this.config = config;
  }

  async parse(request: FastifyRequest): Promise<ParsedMultipartData> {
    this.validateRequest(request);

    try {
      if (this.isBodyPreParsed(request)) {
        return this.parseFromBody(request);
      }

      return this.parseFromMultipart(request);
    } catch (error) {
      throw this.handleParsingError(error);
    }
  }

  private validateRequest(request: FastifyRequest): void {
    if (!request.isMultipart()) {
      throw new ValidationError('multipart/form-data 형식의 요청이 필요합니다.', {
        field: 'content-type',
        reason: 'invalid_format',
      });
    }
  }

  private isBodyPreParsed(request: FastifyRequest): boolean {
    return Boolean(request.body && typeof request.body === 'object');
  }

  private parseFromBody(request: FastifyRequest): ParsedMultipartData {
    const bodyData = request.body as Record<string, any>;

    return {
      fields: this.extractFieldsFromBody(bodyData),
      files: this.extractFilesFromBody(bodyData),
    };
  }

  private extractFieldsFromBody(bodyData: Record<string, any>): Record<string, string> {
    const fields: Record<string, string> = {};

    // 파일이 아닌 필드들만 추출
    Object.entries(bodyData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !this.isFileField(value)) {
        fields[key] = String(value);
      }
    });

    return fields;
  }

  private extractFilesFromBody(bodyData: Record<string, any>): File[] {
    const files: File[] = [];

    Object.values(bodyData).forEach((value) => {
      if (this.isFileField(value)) {
        if (Array.isArray(value)) {
          files.push(...value);
        } else {
          files.push(value);
        }
      }
    });

    return files;
  }

  private isFileField(value: unknown): value is File {
    return (
      value instanceof File ||
      (value !== null &&
        typeof value === 'object' &&
        'name' in value &&
        'size' in value &&
        'type' in value)
    );
  }

  private async parseFromMultipart(request: FastifyRequest): Promise<ParsedMultipartData> {
    const result: ParsedMultipartData = {
      fields: {},
      files: [],
    };

    const parts = request.parts();
    let partCount = 0;

    for await (const part of parts) {
      partCount++;

      if (part.type === 'file') {
        const file = await this.processFilePart(part);
        result.files.push(file);
      } else {
        this.processFieldPart(part, result.fields);
      }
    }

    if (partCount === 0) {
      throw new ValidationError('multipart 데이터가 비어있습니다.', {
        field: 'request',
        reason: 'empty_multipart',
      });
    }

    this.validateParsedData(result);
    return result;
  }

  private async processFilePart(part: any): Promise<File> {
    this.validateFileUpload(part);

    const buffer = await part.toBuffer();
    return new File([buffer], part.filename || 'upload', {
      type: part.mimetype,
    });
  }

  private processFieldPart(part: any, fields: Record<string, string>): void {
    const fieldValue = part.value;
    if (fieldValue !== undefined && fieldValue !== null) {
      fields[part.fieldname] = String(fieldValue);
    }
  }

  private validateFileUpload(part: any): void {
    if (!this.config.allowedMimeTypes.includes(part.mimetype)) {
      throw new ValidationError(`지원하지 않는 파일 형식입니다: ${part.mimetype}`, {
        field: 'file',
        reason: 'invalid_mime_type',
        context: {
          received: part.mimetype,
          allowed: this.config.allowedMimeTypes,
        },
      });
    }

    if (part.file?.bytesRead > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      throw new ValidationError(`파일 크기가 제한을 초과했습니다. 최대 ${maxSizeMB}MB`, {
        field: 'file',
        reason: 'file_size_exceeded',
        context: {
          size: part.file.bytesRead,
          maxSize: this.config.maxFileSize,
        },
      });
    }

    if (!part.filename?.trim()) {
      throw new ValidationError('파일명이 유효하지 않습니다.', {
        field: 'file',
        reason: 'invalid_filename',
      });
    }
  }

  private validateParsedData(data: ParsedMultipartData): void {
    if (data.files.length > this.config.maxFileCount) {
      throw new ValidationError(
        `파일 개수가 제한을 초과했습니다. 최대 ${this.config.maxFileCount}개`,
        {
          field: 'files',
          reason: 'max_count_exceeded',
          context: {
            received: data.files.length,
            max: this.config.maxFileCount,
          },
        },
      );
    }

    const missingFields = this.config.requiredFields.filter(
      (field) => !data.fields[field] || data.fields[field].trim() === '',
    );

    if (missingFields.length > 0) {
      throw new ValidationError(`필수 필드가 누락되었습니다: ${missingFields.join(', ')}`, {
        field: 'required_fields',
        reason: 'missing_required',
        context: { missingFields },
      });
    }
  }

  private handleParsingError(error: unknown): BaseError {
    if (error instanceof BaseError) {
      return error;
    }

    const message = error instanceof Error ? error.message : '알 수 없는 파싱 오류';
    return new BaseError(ErrorCode.VALIDATION_ERROR, `multipart 파싱 실패: ${message}`, {
      context: { originalError: message },
    });
  }
}
