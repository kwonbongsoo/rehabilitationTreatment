import {
  formatPrice,
  calculateDiscountRate,
  calculateDiscountedPrice,
  formatCompactNumber,
  formatRatingStars,
  omitDeep,
  omitTokens,
  omitSensitiveData,
  SENSITIVE_KEYS,
} from '../formatters';

describe('포맷터 유틸리티', () => {
  describe('formatPrice', () => {
    it('기본 가격을 올바르게 포맷팅한다', () => {
      expect(formatPrice(1000)).toBe('1,000원');
      expect(formatPrice(10000)).toBe('10,000원');
    });

    it('원 기호 없이 가격을 포맷팅한다', () => {
      expect(formatPrice(1000, false)).toBe('1,000');
      expect(formatPrice(10000, false)).toBe('10,000');
    });

    it('handles zero and negative values', () => {
      expect(formatPrice(0)).toBe('0원');
      expect(formatPrice(-1000)).toBe('-1,000원');
    });

    it('0과 음수 값을 처리한다', () => {
      expect(formatPrice(0)).toBe('0원');
      expect(formatPrice(-1000)).toBe('-1,000원');
    });

    it('소수점 값을 처리한다', () => {
      expect(formatPrice(1000.5)).toBe('1,000.5원');
      expect(formatPrice(1000.4)).toBe('1,000.4원');
    });
  });

  describe('calculateDiscountRate', () => {
    it('할인율을 올바르게 계산한다', () => {
      expect(calculateDiscountRate(10000, 8000)).toBe(20);
      expect(calculateDiscountRate(5000, 4000)).toBe(20);
    });

    it('원가가 0인 경우를 처리한다', () => {
      expect(calculateDiscountRate(0, 1000)).toBe(0);
    });

    it('동일한 가격인 경우를 처리한다', () => {
      expect(calculateDiscountRate(1000, 1000)).toBe(0);
    });
  });

  describe('calculateDiscountedPrice', () => {
    it('할인된 가격을 올바르게 계산한다', () => {
      expect(calculateDiscountedPrice(10000, 20)).toBe(8000);
      expect(calculateDiscountedPrice(5000, 10)).toBe(4500);
    });

    it('할인율이 0인 경우를 처리한다', () => {
      expect(calculateDiscountedPrice(1000, 0)).toBe(1000);
    });

    it('100% 할인인 경우를 처리한다', () => {
      expect(calculateDiscountedPrice(1000, 100)).toBe(0);
    });
  });

  describe('formatCompactNumber', () => {
    it('큰 숫자를 올바르게 포맷팅한다', () => {
      expect(formatCompactNumber(1200)).toBe('1.2K');
      expect(formatCompactNumber(1500000)).toBe('1.5M');
    });

    it('작은 숫자를 처리한다', () => {
      expect(formatCompactNumber(999)).toBe('999');
      expect(formatCompactNumber(100)).toBe('100');
    });

    it('0과 음수 값을 처리한다', () => {
      expect(formatCompactNumber(0)).toBe('0');
      expect(formatCompactNumber(-1000)).toBe('-1000');
    });
  });

  describe('formatRatingStars', () => {
    it('정수 별점을 포맷팅한다', () => {
      expect(formatRatingStars(5)).toBe('★★★★★');
      expect(formatRatingStars(3)).toBe('★★★☆☆');
    });

    it('반 개 별점을 포맷팅한다', () => {
      expect(formatRatingStars(4.5)).toBe('★★★★☆');
      expect(formatRatingStars(2.5)).toBe('★★☆☆☆');
    });

    it('0점 평점을 처리한다', () => {
      expect(formatRatingStars(0)).toBe('☆☆☆☆☆');
    });
  });

  describe('omitDeep', () => {
    it('객체에서 지정된 키를 제거한다', () => {
      const obj = {
        name: 'test',
        password: 'secret',
        nested: {
          token: 'secret-token',
          safe: 'data',
        },
      };

      const result = omitDeep(obj, ['password', 'token']);
      expect(result).toEqual({
        name: 'test',
        nested: {
          safe: 'data',
        },
      });
    });

    it('객체가 포함된 배열을 처리한다', () => {
      const obj = {
        users: [
          { name: 'user1', password: 'secret1' },
          { name: 'user2', password: 'secret2' },
        ],
      };

      const result = omitDeep(obj, ['password']);
      expect(result).toEqual({
        users: [
          { name: 'user1' },
          { name: 'user2' },
        ],
      });
    });
  });

  describe('omitTokens', () => {
    it('토큰 관련 키를 제거한다', () => {
      const obj = {
        name: 'test',
        access_token: 'secret',
        refresh_token: 'refresh',
        safe_data: 'public',
      };

      const result = omitTokens(obj);
      expect(result).toEqual({
        name: 'test',
        safe_data: 'public',
      });
    });
  });

  describe('omitSensitiveData', () => {
    it('모든 민감한 키를 제거한다', () => {
      const obj = {
        name: 'test',
        password: 'secret',
        api_key: 'key',
        safe_data: 'public',
      };

      const result = omitSensitiveData(obj);
      expect(result).toEqual({
        name: 'test',
        safe_data: 'public',
      });
    });
  });

  describe('SENSITIVE_KEYS', () => {
    it('예상되는 민감한 키 패턴을 포함한다', () => {
      expect(SENSITIVE_KEYS).toContain('password');
      expect(SENSITIVE_KEYS).toContain('access_token');
      expect(SENSITIVE_KEYS).toContain('api_key');
      expect(SENSITIVE_KEYS.length).toBeGreaterThan(5);
    });
  });
});