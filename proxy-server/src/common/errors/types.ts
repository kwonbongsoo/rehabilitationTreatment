export interface ErrorDetails {
  field?: string;
  reason?: string;
  context?: any;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetails;
  };
  timestamp: string;
}

export enum ErrorCode {
  // 인증 관련 (1xxx)
  INVALID_TOKEN = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  INVALID_CREDENTIALS = 'AUTH_1003',
  FORBIDDEN = 'AUTH_1004',

  // 유효성 검사 관련 (2xxx)
  VALIDATION_ERROR = 'VAL_2001',
  INVALID_INPUT = 'VAL_2002',

  // 비즈니스 로직 관련 (3xxx)
  RESOURCE_NOT_FOUND = 'BIZ_3001',
  DUPLICATE_RESOURCE = 'BIZ_3002',

  // 시스템 관련 (5xxx)
  INTERNAL_ERROR = 'SYS_5001',
  SERVICE_UNAVAILABLE = 'SYS_5002',
  RATE_LIMIT_EXCEEDED = 'SYS_5003',
  FILE_READ_ERROR = 'SYS_5004',
  TIMEOUT_ERROR = 'SYS_5005',

  // 외부 서비스 관련 (6xxx)
  EXTERNAL_SERVICE_ERROR = 'EXT_6001',
  EXTERNAL_SERVICE_TIMEOUT = 'EXT_6002',
  EXTERNAL_SERVICE_UNAVAILABLE = 'EXT_6003',
}
