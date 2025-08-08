import { ErrorHandler, ErrorType, ErrorClassifier } from '../errorHandling';
import { ValidationError } from '@ecommerce/common';

describe('에러 핸들러', () => {
  describe('에러 분류기', () => {
    it('유효성 검사 에러를 올바르게 분류한다', () => {
      const validationError = new ValidationError('Validation failed', { field: 'email' });
      const result = ErrorClassifier.classify(validationError);

      expect(result).toBe(ErrorType.VALIDATION);
    });

    it('일반 에러를 올바르게 분류한다', () => {
      const genericError = new Error('Generic error');
      const result = ErrorClassifier.classify(genericError);

      expect(result).toBe(ErrorType.UNKNOWN);
    });

    it('null/undefined 에러를 처리한다', () => {
      expect(ErrorClassifier.classify(null)).toBe(ErrorType.UNKNOWN);
      expect(ErrorClassifier.classify(undefined)).toBe(ErrorType.UNKNOWN);
    });

    it('네트워크 에러를 올바르게 분류한다', () => {
      const networkError = new Error('Network request failed');
      const result = ErrorClassifier.classify(networkError);

      expect(result).toBe(ErrorType.NETWORK);
    });

    it('인증 에러를 올바르게 분류한다', () => {
      const authError = new Error('Authentication failed');
      const result = ErrorClassifier.classify(authError);

      expect(result).toBe(ErrorType.AUTHENTICATION);
    });
  });

  describe('기본 메시지 가져오기', () => {
    it('유효성 검사 에러에 대한 올바른 메시지를 반환한다', () => {
      const message = ErrorClassifier.getDefaultMessage(ErrorType.VALIDATION);
      expect(message).toBe('입력 정보를 확인해주세요.');
    });

    it('인증 에러에 대한 올바른 메시지를 반환한다', () => {
      const message = ErrorClassifier.getDefaultMessage(ErrorType.AUTHENTICATION);
      expect(message).toBe('로그인이 필요합니다.');
    });

    it('네트워크 에러에 대한 올바른 메시지를 반환한다', () => {
      const message = ErrorClassifier.getDefaultMessage(ErrorType.NETWORK);
      expect(message).toBe('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    });

    it('알 수 없는 에러에 대한 기본 메시지를 반환한다', () => {
      const message = ErrorClassifier.getDefaultMessage(ErrorType.UNKNOWN);
      expect(message).toBe('알 수 없는 오류가 발생했습니다.');
    });
  });

  describe('에러 정규화', () => {
    it('ValidationError를 올바르게 정규화한다', () => {
      const validationError = new ValidationError('Validation failed', { field: 'email' });
      const result = ErrorHandler.normalize(validationError, 'test context');

      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.message).toBe('test context: Validation failed');
      expect(result.context).toBe('test context');
    });

    it('일반 Error를 올바르게 정규화한다', () => {
      const genericError = new Error('Generic error');
      const result = ErrorHandler.normalize(genericError, 'test context');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('test context: Generic error');
      expect(result.context).toBe('test context');
    });

    it('문자열 에러를 올바르게 정규화한다', () => {
      const stringError = 'String error';
      const result = ErrorHandler.normalize(stringError, 'test context');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('test context: String error');
      expect(result.context).toBe('test context');
    });

    it('알 수 없는 에러 타입을 처리한다', () => {
      const unknownError = { weird: 'object' };
      const result = ErrorHandler.normalize(unknownError, 'test context');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('test context: {"weird":"object"}');
      expect(result.context).toBe('test context');
    });
  });

  describe('폼 에러 처리', () => {
    it('폼 유효성 검사 에러를 올바르게 처리한다', () => {
      const validationError = new ValidationError('Validation failed', { field: 'email' });
      const result = ErrorHandler.handleFormError(validationError, 'user registration');

      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.message).toBe('user registration: Validation failed');
      expect(result.context).toBe('user registration');
    });

    it('일반 폼 에러를 처리한다', () => {
      const genericError = new Error('Form submission failed');
      const result = ErrorHandler.handleFormError(genericError, 'contact form');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('contact form: Form submission failed');
    });
  });

  describe('API 에러 처리', () => {
    it('로깅과 함께 API 에러를 처리한다', () => {
      const apiError = new Error('API request failed');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = ErrorHandler.handleApiError(apiError, 'user API');

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toBe('user API: API request failed');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});