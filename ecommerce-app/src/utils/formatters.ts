/**
 * 가격 포맷팅 유틸리티 함수들
 */

/**
 * 숫자를 한국 원화 형식으로 포맷팅
 * @param price 가격 (숫자)
 * @param includeWon 원화 단위 포함 여부 (기본값: true)
 * @returns 포맷팅된 가격 문자열
 */
export const formatPrice = (price: number, includeWon = true): string => {
  const formatted = new Intl.NumberFormat('ko-KR').format(price);
  return includeWon ? `${formatted}원` : formatted;
};

/**
 * 할인율 계산
 * @param originalPrice 원가
 * @param salePrice 할인가
 * @returns 할인율 (정수)
 */
export const calculateDiscountRate = (originalPrice: number, salePrice: number): number => {
  if (!originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * 할인된 가격 계산
 * @param price 원가
 * @param discountRate 할인율 (%)
 * @returns 할인된 가격
 */
export const calculateDiscountedPrice = (price: number, discountRate: number): number => {
  return Math.round(price * (1 - discountRate / 100));
};

/**
 * 숫자를 천 단위로 줄여서 표시 (예: 1200 → 1.2K)
 * @param num 숫자
 * @returns 축약된 문자열
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * 평점을 별 문자열로 변환
 * @param rating 평점 (0-5)
 * @returns 별 문자열
 */
export const formatRatingStars = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) {
    stars += '☆';
  }
  const emptyStars = 5 - Math.ceil(rating);
  stars += '☆'.repeat(emptyStars);

  return stars;
};

/**
 * 객체에서 지정된 키들을 깊이 있게 제거하는 유틸리티 함수
 * @param obj 원본 객체
 * @param keysToOmit 제거할 키들의 배열
 * @returns 지정된 키들이 제거된 새로운 객체
 */
export function omitDeep<T extends Record<string, unknown>>(obj: T, keysToOmit: string[]): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    // 제거할 키가 아닌 경우에만 포함
    if (!keysToOmit.includes(key)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // 중첩된 객체인 경우 재귀적으로 처리
        (result as Record<string, unknown>)[key] = omitDeep(
          value as Record<string, unknown>,
          keysToOmit,
        );
      } else if (Array.isArray(value)) {
        // 배열인 경우 각 요소를 처리
        (result as Record<string, unknown>)[key] = value.map((item) =>
          item && typeof item === 'object'
            ? omitDeep(item as Record<string, unknown>, keysToOmit)
            : item,
        );
      } else {
        // 원시값인 경우 그대로 복사
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }

  return result;
}

/**
 * 민감한 데이터 키들을 정의한 상수
 */
export const SENSITIVE_KEYS = [
  'access_token',
  'token',
  'refresh_token',
  'password',
  'secret',
  'key',
  'private_key',
  'api_key',
] as const;

/**
 * 토큰 관련 키들만 제거하는 특화된 함수
 * @param obj 원본 객체
 * @returns 토큰 관련 키들이 제거된 새로운 객체
 */
export function omitTokens<T extends Record<string, any>>(obj: T): T {
  return omitDeep(obj, ['access_token', 'token', 'refresh_token']);
}

/**
 * 모든 민감한 데이터를 제거하는 함수
 * @param obj 원본 객체
 * @returns 민감한 키들이 제거된 새로운 객체
 */
export function omitSensitiveData<T extends Record<string, any>>(obj: T): T {
  return omitDeep(obj, [...SENSITIVE_KEYS]);
}
