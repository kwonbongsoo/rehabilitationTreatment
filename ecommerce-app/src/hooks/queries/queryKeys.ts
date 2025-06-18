/**
 * 쿼리 키 중앙 관리
 * 타입 안전성과 일관성을 보장
 *
 * 베스트 프랙티스:
 * 1. 계층적 구조로 관리
 * 2. 무효화하기 쉬운 구조
 * 3. 타입 안전성 보장
 */

// 기본 쿼리 키 팩토리
export const queryKeys = {
  // 사용자 관련 쿼리
  user: {
    all: ['user'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },
} as const;

// 편의를 위한 타입 export
export type QueryKeys = typeof queryKeys;
export type UserQueryKeys = typeof queryKeys.user;
