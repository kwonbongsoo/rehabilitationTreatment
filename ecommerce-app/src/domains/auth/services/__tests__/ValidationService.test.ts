/**
 * AuthValidationService 단위 테스트
 */
import { AuthValidationService, type LoginFormData, type RegisterFormData, type ForgotPasswordFormData } from '../ValidationService';
import * as ValidationUtils from '@/utils/validation';
import { REGISTER_CONSTANTS } from '../../constants/registerConstants';

// Mock utils/validation
jest.mock('@/utils/validation', () => ({
  EmailValidator: {
    validate: jest.fn(),
  },
  PasswordValidator: {
    validate: jest.fn(),
    validateConfirmation: jest.fn(),
    validateStrength: jest.fn(),
  },
  IdValidator: {
    validate: jest.fn(),
  },
  NameValidator: {
    validate: jest.fn(),
  },
}));

describe('AuthValidationService', () => {
  let validationService: AuthValidationService;
  let mockEmailValidator: jest.Mocked<typeof ValidationUtils.EmailValidator>;
  let mockPasswordValidator: jest.Mocked<typeof ValidationUtils.PasswordValidator>;
  let mockIdValidator: jest.Mocked<typeof ValidationUtils.IdValidator>;
  let mockNameValidator: jest.Mocked<typeof ValidationUtils.NameValidator>;

  beforeEach(() => {
    validationService = new AuthValidationService();
    mockEmailValidator = ValidationUtils.EmailValidator as jest.Mocked<typeof ValidationUtils.EmailValidator>;
    mockPasswordValidator = ValidationUtils.PasswordValidator as jest.Mocked<typeof ValidationUtils.PasswordValidator>;
    mockIdValidator = ValidationUtils.IdValidator as jest.Mocked<typeof ValidationUtils.IdValidator>;
    mockNameValidator = ValidationUtils.NameValidator as jest.Mocked<typeof ValidationUtils.NameValidator>;
    jest.clearAllMocks();
  });

  describe('validateLoginCredentials', () => {
    const validLoginData: LoginFormData = {
      id: 'testuser',
      password: 'password123',
    };

    it('유효한 로그인 데이터에 대해 성공 결과를 반환한다', () => {
      mockIdValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordValidator.validate.mockReturnValue({ isValid: true, errors: [] });

      const result = validationService.validateLoginCredentials(validLoginData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(validLoginData.id, REGISTER_CONSTANTS.MIN_LOGIN_ID_LENGTH);
      expect(mockPasswordValidator.validate).toHaveBeenCalledWith(validLoginData.password, REGISTER_CONSTANTS.MIN_LOGIN_PASSWORD_LENGTH);
    });

    it('아이디가 비어있으면 에러를 반환한다', () => {
      const invalidData = { ...validLoginData, id: '' };

      const result = validationService.validateLoginCredentials(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('아이디를 입력해주세요.');
      expect(mockIdValidator.validate).not.toHaveBeenCalled();
    });

    it('아이디가 공백만 있으면 에러를 반환한다', () => {
      const invalidData = { ...validLoginData, id: '   ' };

      const result = validationService.validateLoginCredentials(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('아이디를 입력해주세요.');
      expect(mockIdValidator.validate).not.toHaveBeenCalled();
    });

    it('비밀번호가 비어있으면 에러를 반환한다', () => {
      const invalidData = { ...validLoginData, password: '' };

      const result = validationService.validateLoginCredentials(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호를 입력해주세요.');
      expect(mockPasswordValidator.validate).not.toHaveBeenCalled();
    });

    it('아이디 검증 실패 시 에러를 포함한다', () => {
      mockIdValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['아이디는 최소 4자 이상이어야 합니다.'] 
      });
      mockPasswordValidator.validate.mockReturnValue({ isValid: true, errors: [] });

      const result = validationService.validateLoginCredentials(validLoginData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('아이디는 최소 4자 이상이어야 합니다.');
    });

    it('비밀번호 검증 실패 시 에러를 포함한다', () => {
      mockIdValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['비밀번호는 최소 6자 이상이어야 합니다.'] 
      });

      const result = validationService.validateLoginCredentials(validLoginData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호는 최소 6자 이상이어야 합니다.');
    });

    it('여러 검증 실패 시 모든 에러를 포함한다', () => {
      const invalidData = { id: '', password: '' };

      const result = validationService.validateLoginCredentials(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual([
        '아이디를 입력해주세요.',
        '비밀번호를 입력해주세요.'
      ]);
    });
  });

  describe('validateRegisterForm', () => {
    const validRegisterData: RegisterFormData = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: '테스트 사용자',
      email: 'test@example.com',
    };

    beforeEach(() => {
      // 기본적으로 모든 검증이 통과하도록 설정
      mockIdValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockNameValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockEmailValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordValidator.validateConfirmation.mockReturnValue({ isValid: true, errors: [] });
    });

    it('유효한 회원가입 데이터에 대해 성공 결과를 반환한다', () => {
      const result = validationService.validateRegisterForm(validRegisterData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(mockIdValidator.validate).toHaveBeenCalledWith(validRegisterData.id, REGISTER_CONSTANTS.MIN_ID_LENGTH);
      expect(mockNameValidator.validate).toHaveBeenCalledWith(validRegisterData.name, REGISTER_CONSTANTS.MIN_NAME_LENGTH);
      expect(mockEmailValidator.validate).toHaveBeenCalledWith(validRegisterData.email);
      expect(mockPasswordValidator.validate).toHaveBeenCalledWith(validRegisterData.password, REGISTER_CONSTANTS.MIN_PASSWORD_LENGTH);
      expect(mockPasswordValidator.validateConfirmation).toHaveBeenCalledWith(validRegisterData.password, validRegisterData.confirmPassword);
    });

    it('아이디 검증 실패 시 에러를 포함한다', () => {
      mockIdValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['아이디는 영문자로 시작해야 합니다.'] 
      });

      const result = validationService.validateRegisterForm(validRegisterData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('아이디는 영문자로 시작해야 합니다.');
    });

    it('이름 검증 실패 시 에러를 포함한다', () => {
      mockNameValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['이름은 최소 2자 이상이어야 합니다.'] 
      });

      const result = validationService.validateRegisterForm(validRegisterData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('이름은 최소 2자 이상이어야 합니다.');
    });

    it('이메일 검증 실패 시 에러를 포함한다', () => {
      mockEmailValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['올바른 이메일 형식이 아닙니다.'] 
      });

      const result = validationService.validateRegisterForm(validRegisterData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('올바른 이메일 형식이 아닙니다.');
    });

    it('비밀번호 검증 실패 시 에러를 포함한다', () => {
      mockPasswordValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['비밀번호는 특수문자를 포함해야 합니다.'] 
      });

      const result = validationService.validateRegisterForm(validRegisterData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호는 특수문자를 포함해야 합니다.');
    });

    it('비밀번호 확인 검증 실패 시 에러를 포함한다', () => {
      mockPasswordValidator.validateConfirmation.mockReturnValue({ 
        isValid: false, 
        errors: ['비밀번호가 일치하지 않습니다.'] 
      });

      const result = validationService.validateRegisterForm(validRegisterData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호가 일치하지 않습니다.');
    });

    it('여러 검증 실패 시 모든 에러를 포함한다', () => {
      mockIdValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['아이디 오류'] 
      });
      mockEmailValidator.validate.mockReturnValue({ 
        isValid: false, 
        errors: ['이메일 오류'] 
      });

      const result = validationService.validateRegisterForm(validRegisterData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('아이디 오류');
      expect(result.errors).toContain('이메일 오류');
    });
  });

  describe('validateForgotPasswordForm', () => {
    const validForgotPasswordData: ForgotPasswordFormData = {
      email: 'test@example.com',
    };

    it('유효한 이메일에 대해 EmailValidator 결과를 반환한다', () => {
      const expectedResult = { isValid: true, errors: [] };
      mockEmailValidator.validate.mockReturnValue(expectedResult);

      const result = validationService.validateForgotPasswordForm(validForgotPasswordData);

      expect(result).toEqual(expectedResult);
      expect(mockEmailValidator.validate).toHaveBeenCalledWith(validForgotPasswordData.email);
    });

    it('이메일 검증 실패 시 에러를 반환한다', () => {
      const expectedResult = { 
        isValid: false, 
        errors: ['올바른 이메일 형식이 아닙니다.'] 
      };
      mockEmailValidator.validate.mockReturnValue(expectedResult);

      const result = validationService.validateForgotPasswordForm(validForgotPasswordData);

      expect(result).toEqual(expectedResult);
      expect(mockEmailValidator.validate).toHaveBeenCalledWith(validForgotPasswordData.email);
    });
  });

  describe('validateRegisterFormFields', () => {
    const validRegisterData: RegisterFormData = {
      id: 'testuser',
      password: 'password123',
      confirmPassword: 'password123',
      name: '테스트 사용자',
      email: 'test@example.com',
    };

    beforeEach(() => {
      mockIdValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockNameValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockEmailValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordValidator.validate.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordValidator.validateConfirmation.mockReturnValue({ isValid: true, errors: [] });
    });

    it('필드별 검증 결과를 올바르게 반환한다', () => {
      const result = validationService.validateRegisterFormFields(validRegisterData);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('password');
      expect(result).toHaveProperty('confirmPassword');

      expect(mockIdValidator.validate).toHaveBeenCalledWith(validRegisterData.id, REGISTER_CONSTANTS.MIN_ID_LENGTH);
      expect(mockNameValidator.validate).toHaveBeenCalledWith(validRegisterData.name, REGISTER_CONSTANTS.MIN_NAME_LENGTH);
      expect(mockEmailValidator.validate).toHaveBeenCalledWith(validRegisterData.email);
      expect(mockPasswordValidator.validate).toHaveBeenCalledWith(validRegisterData.password, REGISTER_CONSTANTS.MIN_PASSWORD_LENGTH);
      expect(mockPasswordValidator.validateConfirmation).toHaveBeenCalledWith(validRegisterData.password, validRegisterData.confirmPassword);
    });
  });

  describe('evaluatePasswordStrength', () => {
    it('PasswordValidator.validateStrength 결과를 반환한다', () => {
      const password = 'testPassword123!';
      const expectedResult = {
        score: 85,
        feedback: ['강력한 비밀번호입니다.'],
        isStrong: true,
      };
      mockPasswordValidator.validateStrength.mockReturnValue(expectedResult);

      const result = validationService.evaluatePasswordStrength(password);

      expect(result).toEqual(expectedResult);
      expect(mockPasswordValidator.validateStrength).toHaveBeenCalledWith(password);
    });
  });

  describe('formatValidationErrors', () => {
    it('에러 배열을 공백으로 구분된 문자열로 변환한다', () => {
      const errors = ['에러1', '에러2', '에러3'];
      const result = validationService.formatValidationErrors(errors);

      expect(result).toBe('에러1 에러2 에러3');
    });

    it('빈 배열에 대해 빈 문자열을 반환한다', () => {
      const errors: string[] = [];
      const result = validationService.formatValidationErrors(errors);

      expect(result).toBe('');
    });

    it('단일 에러에 대해 해당 에러를 반환한다', () => {
      const errors = ['단일 에러'];
      const result = validationService.formatValidationErrors(errors);

      expect(result).toBe('단일 에러');
    });
  });

  describe('throwIfInvalid', () => {
    it('유효한 결과에 대해 예외를 발생시키지 않는다', () => {
      const validResult = { isValid: true, errors: [] };

      expect(() => {
        validationService.throwIfInvalid(validResult);
      }).not.toThrow();
    });

    it('유효하지 않은 결과에 대해 에러 메시지와 함께 예외를 발생시킨다', () => {
      const invalidResult = { 
        isValid: false, 
        errors: ['에러1', '에러2'] 
      };

      expect(() => {
        validationService.throwIfInvalid(invalidResult);
      }).toThrow('에러1 에러2');
    });

    it('빈 에러 배열로 유효하지 않은 결과에 대해 빈 문자열로 예외를 발생시킨다', () => {
      const invalidResult = { 
        isValid: false, 
        errors: [] 
      };

      expect(() => {
        validationService.throwIfInvalid(invalidResult);
      }).toThrow('');
    });
  });
});

describe('AuthValidationService 싱글톤과 별칭', () => {
  it('authValidationService 인스턴스가 올바르게 생성된다', () => {
    const { authValidationService } = require('../ValidationService');
    
    expect(authValidationService).toBeInstanceOf(AuthValidationService);
  });

  it('ValidationService 별칭이 AuthValidationService 클래스를 참조한다', () => {
    const { ValidationService } = require('../ValidationService');
    
    expect(ValidationService).toBe(AuthValidationService);
  });
});