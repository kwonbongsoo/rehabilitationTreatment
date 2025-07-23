import {
  EmailValidator,
  PasswordValidator,
  IdValidator,
  NameValidator,
  PhoneValidator,
  ValidationUtils,
  validateRegisterForm,
  validateLoginForm,
  validateForgotPasswordForm,
} from '../validation';

describe('EmailValidator', () => {
  describe('validate', () => {
    it('올바른 이메일 형식을 검증한다', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.kr',
        'email+tag@site.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = EmailValidator.validate(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('잘못된 이메일 형식을 검증한다', () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test..test@domain.com',
        'test@domain',
        'test@domain.',
        'test @domain.com',
        'test@domain .com',
      ];

      invalidEmails.forEach((email) => {
        const result = EmailValidator.validate(email);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('올바른 이메일 형식을 입력해주세요.');
      });
    });

    it('빈 값을 검증한다', () => {
      const emptyValues = ['', ' ', '   ', null, undefined];

      emptyValues.forEach((value) => {
        const result = EmailValidator.validate(value as string);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('이메일 주소를 입력해주세요.');
      });
    });

    it('공백이 포함된 이메일을 처리한다', () => {
      const result = EmailValidator.validate('  test@example.com  ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('isValid', () => {
    it('올바른 이메일에 대해 true를 반환한다', () => {
      expect(EmailValidator.isValid('test@example.com')).toBe(true);
    });

    it('잘못된 이메일에 대해 false를 반환한다', () => {
      expect(EmailValidator.isValid('invalid-email')).toBe(false);
    });
  });

  describe('getErrors', () => {
    it('에러 배열을 반환한다', () => {
      const errors = EmailValidator.getErrors('invalid-email');
      expect(errors).toBeInstanceOf(Array);
      expect(errors).toContain('올바른 이메일 형식을 입력해주세요.');
    });
  });
});

describe('PasswordValidator', () => {
  describe('validate', () => {
    it('올바른 비밀번호를 검증한다', () => {
      const validPasswords = ['password123', 'mySecurePassword', 'P@ssw0rd!', 'verylongpassword'];

      validPasswords.forEach((password) => {
        const result = PasswordValidator.validate(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('너무 짧은 비밀번호를 검증한다', () => {
      const shortPasswords = ['123', 'abc', 'short'];

      shortPasswords.forEach((password) => {
        const result = PasswordValidator.validate(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('비밀번호는 8자 이상이어야 합니다.');
      });
    });

    it('커스텀 최소 길이를 지원한다', () => {
      const result = PasswordValidator.validate('12345', 6);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호는 6자 이상이어야 합니다.');
    });

    it('빈 비밀번호를 검증한다', () => {
      const emptyValues = ['', ' ', '   ', null, undefined];

      emptyValues.forEach((value) => {
        const result = PasswordValidator.validate(value as string);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('비밀번호를 입력해주세요.');
      });
    });
  });

  describe('validateStrength', () => {
    it('약한 비밀번호의 강도를 측정한다', () => {
      const result = PasswordValidator.validateStrength('weak');
      expect(result.score).toBeLessThan(3);
      expect(result.isStrong).toBe(false);
      expect(result.feedback).toContain('비밀번호가 너무 약합니다.');
    });

    it('강한 비밀번호의 강도를 측정한다', () => {
      const result = PasswordValidator.validateStrength('MyStr0ngP@ssw0rd!');
      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(result.isStrong).toBe(true);
    });

    it('비밀번호 강도 점수를 올바르게 계산한다', () => {
      const testCases = [
        { password: 'password', expectedScore: 2 }, // 8자 이상 + 소문자
        { password: 'Password', expectedScore: 3 }, // 8자 이상 + 소문자 + 대문자
        { password: 'Password1', expectedScore: 4 }, // 8자 이상 + 소문자 + 대문자 + 숫자
        { password: 'password1', expectedScore: 3 }, // 8자 이상 + 소문자 + 숫자
        { password: 'Password1!', expectedScore: 5 }, // 8자 이상 + 소문자 + 대문자 + 숫자 + 특수문자
      ];

      testCases.forEach(({ password, expectedScore }) => {
        const result = PasswordValidator.validateStrength(password);
        expect(result.score).toBe(expectedScore);
      });
    });

    it('12자 이상 비밀번호에 대한 피드백을 제공한다', () => {
      const result = PasswordValidator.validateStrength('short');
      expect(result.feedback).toContain('12자 이상 사용하시면 더 안전합니다.');
    });
  });

  describe('validateConfirmation', () => {
    it('일치하는 비밀번호를 검증한다', () => {
      const result = PasswordValidator.validateConfirmation('password123', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('일치하지 않는 비밀번호를 검증한다', () => {
      const result = PasswordValidator.validateConfirmation('password123', 'different');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호가 일치하지 않습니다.');
    });

    it('빈 확인 비밀번호를 검증한다', () => {
      const result = PasswordValidator.validateConfirmation('password123', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('비밀번호 확인을 입력해주세요.');
    });
  });
});

describe('IdValidator', () => {
  describe('validate', () => {
    it('올바른 아이디를 검증한다', () => {
      const validIds = [
        'user123',
        'test_user',
        'user-name',
        'User123',
        'test123_user',
        'user-test_123',
      ];

      validIds.forEach((id) => {
        const result = IdValidator.validate(id);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('잘못된 문자가 포함된 아이디를 검증한다', () => {
      const invalidIds = [
        'user 123',
        'user@test',
        'user.test',
        'user#123',
        'user%test',
        'user&123',
        'user*test',
        'user(123)',
        'user[test]',
        'user{123}',
        'user+test',
        'user=123',
        'user\\test',
        'user/123',
        'user?test',
        'user!123',
        'user~test',
        'user`123',
        'user|test',
        'user<123>',
        'user"test"',
        "user'test'",
        'user;test',
        'user:123',
        'user,test',
        'user.123',
      ];

      invalidIds.forEach((id) => {
        const result = IdValidator.validate(id);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('아이디는 영문, 숫자, _, - 만 사용할 수 있습니다.');
      });
    });

    it('너무 짧은 아이디를 검증한다', () => {
      const result = IdValidator.validate('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('아이디는 4자 이상이어야 합니다.');
    });

    it('커스텀 최소 길이를 지원한다', () => {
      const result = IdValidator.validate('abc', 5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('아이디는 5자 이상이어야 합니다.');
    });

    it('빈 아이디를 검증한다', () => {
      const emptyValues = ['', ' ', '   ', null, undefined];

      emptyValues.forEach((value) => {
        const result = IdValidator.validate(value as string);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('아이디를 입력해주세요.');
      });
    });

    it('공백이 포함된 아이디를 처리한다', () => {
      const result = IdValidator.validate('  user123  ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('NameValidator', () => {
  describe('validate', () => {
    it('올바른 이름을 검증한다', () => {
      const validNames = [
        '홍길동',
        '김영희',
        'John Doe',
        'Jane Smith',
        '이영수',
        'Test User',
        '사용자 테스트',
      ];

      validNames.forEach((name) => {
        const result = NameValidator.validate(name);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('너무 짧은 이름을 검증한다', () => {
      const result = NameValidator.validate('김');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('이름은 2자 이상이어야 합니다.');
    });

    it('커스텀 최소 길이를 지원한다', () => {
      const result = NameValidator.validate('김영', 3);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('이름은 3자 이상이어야 합니다.');
    });

    it('빈 이름을 검증한다', () => {
      const emptyValues = ['', ' ', '   ', null, undefined];

      emptyValues.forEach((value) => {
        const result = NameValidator.validate(value as string);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('이름을 입력해주세요.');
      });
    });

    it('공백이 포함된 이름을 처리한다', () => {
      const result = NameValidator.validate('  홍길동  ');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

describe('PhoneValidator', () => {
  describe('validate', () => {
    it('올바른 전화번호를 검증한다', () => {
      const validPhones = [
        '01012345678',
        '010-1234-5678',
        '01112345678',
        '011-1234-5678',
        '01612345678',
        '016-1234-5678',
        '01712345678',
        '017-1234-5678',
        '01812345678',
        '018-1234-5678',
        '01912345678',
        '019-1234-5678',
        '010123456789',
        '010-123-5678',
      ];

      validPhones.forEach((phone) => {
        const result = PhoneValidator.validate(phone);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('잘못된 전화번호를 검증한다', () => {
      const invalidPhones = [
        '02012345678',
        '010-123-456',
        '010-12345-6789',
        '010123456',
        '01012345678910',
        '010-1234-567890',
        '010 1234 5678',
        '010.1234.5678',
        'abc-1234-5678',
        '010-abcd-5678',
        '010-1234-abcd',
      ];

      invalidPhones.forEach((phone) => {
        const result = PhoneValidator.validate(phone);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('올바른 전화번호 형식을 입력해주세요.');
      });
    });

    it('필수가 아닌 빈 전화번호를 검증한다', () => {
      const result = PhoneValidator.validate('', false);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('필수인 빈 전화번호를 검증한다', () => {
      const result = PhoneValidator.validate('', true);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('전화번호를 입력해주세요.');
    });
  });
});

describe('ValidationUtils', () => {
  describe('required', () => {
    it('필수 값 검증을 수행한다', () => {
      const validValues = ['test', 'hello', 123, true, [], {}];
      validValues.forEach((value) => {
        const result = ValidationUtils.required(value, 'test');
        expect(result.isValid).toBe(true);
      });

      const invalidValues = [null, undefined, '', ' ', '   '];
      invalidValues.forEach((value) => {
        const result = ValidationUtils.required(value, 'test');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('test를 입력해주세요.');
      });
    });
  });

  describe('minLength', () => {
    it('최소 길이 검증을 수행한다', () => {
      const result1 = ValidationUtils.minLength('hello', 3, 'test');
      expect(result1.isValid).toBe(true);

      const result2 = ValidationUtils.minLength('hi', 3, 'test');
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('test는 3자 이상이어야 합니다.');
    });
  });

  describe('maxLength', () => {
    it('최대 길이 검증을 수행한다', () => {
      const result1 = ValidationUtils.maxLength('hi', 5, 'test');
      expect(result1.isValid).toBe(true);

      const result2 = ValidationUtils.maxLength('hello world', 5, 'test');
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('test는 5자 이하여야 합니다.');
    });
  });

  describe('pattern', () => {
    it('패턴 검증을 수행한다', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const result1 = ValidationUtils.pattern(
        'test@example.com',
        emailPattern,
        '올바른 이메일 형식을 입력해주세요.',
      );
      expect(result1.isValid).toBe(true);

      const result2 = ValidationUtils.pattern(
        'invalid-email',
        emailPattern,
        '올바른 이메일 형식을 입력해주세요.',
      );
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('올바른 이메일 형식을 입력해주세요.');
    });
  });

  describe('combineValidations', () => {
    it('여러 검증 결과를 결합한다', () => {
      const validation1 = { isValid: true, errors: [] };
      const validation2 = { isValid: true, errors: [] };
      const validation3 = { isValid: false, errors: ['error1'] };
      const validation4 = { isValid: false, errors: ['error2', 'error3'] };

      const result = ValidationUtils.combineValidations(
        validation1,
        validation2,
        validation3,
        validation4,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['error1', 'error2', 'error3']);
    });
  });
});

describe('폼 검증 함수들', () => {
  describe('validateRegisterForm', () => {
    it('올바른 회원가입 폼을 검증한다', () => {
      const validData = {
        id: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
        name: '홍길동',
        email: 'test@example.com',
      };

      const result = validateRegisterForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('잘못된 회원가입 폼을 검증한다', () => {
      const invalidData = {
        id: 'ab',
        password: '123',
        confirmPassword: '456',
        name: '김',
        email: 'invalid-email',
      };

      const result = validateRegisterForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateLoginForm', () => {
    it('올바른 로그인 폼을 검증한다', () => {
      const validData = {
        id: 'testuser',
        password: 'password123',
      };

      const result = validateLoginForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('잘못된 로그인 폼을 검증한다', () => {
      const invalidData = {
        id: '',
        password: '',
      };

      const result = validateLoginForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateForgotPasswordForm', () => {
    it('올바른 비밀번호 찾기 폼을 검증한다', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = validateForgotPasswordForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('잘못된 비밀번호 찾기 폼을 검증한다', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = validateForgotPasswordForm(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
