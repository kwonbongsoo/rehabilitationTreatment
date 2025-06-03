/**
 * 쿼리 키 중앙 관리
 * 타입 안전성과 일관성을 보장
 */

// 기본 쿼리 키 팩토리
export const queryKeys = {
    // 사용자 관련 쿼리
    user: {
        all: ['user'] as const,
        role: () => [...queryKeys.user.all, 'role'] as const,
        id: () => [...queryKeys.user.all, 'id'] as const,
        name: () => [...queryKeys.user.all, 'name'] as const,
    },

    // 인증 관련 쿼리 (user와 분리)
    auth: {
        all: ['auth'] as const,
        token: () => [...queryKeys.auth.all, 'token'] as const,
        session: () => [...queryKeys.auth.all, 'session'] as const,
    },

    // // 상품 관련 쿼리 (향후 확장용)
    // products: {
    //     all: ['products'] as const,
    //     lists: () => [...queryKeys.products.all, 'list'] as const,
    //     list: (filters: Record<string, any>) =>
    //         [...queryKeys.products.lists(), { filters }] as const,
    //     details: () => [...queryKeys.products.all, 'detail'] as const,
    //     detail: (id: string) => [...queryKeys.products.details(), id] as const,
    // },

    // // 주문 관련 쿼리 (향후 확장용)
    // orders: {
    //     all: ['orders'] as const,
    //     lists: () => [...queryKeys.orders.all, 'list'] as const,
    //     list: (filters: Record<string, any>) =>
    //         [...queryKeys.orders.lists(), { filters }] as const,
    //     details: () => [...queryKeys.orders.all, 'detail'] as const,
    //     detail: (id: string) => [...queryKeys.orders.details(), id] as const,
    // }
} as const;

// 편의를 위한 타입 export
export type QueryKeys = typeof queryKeys;
export type UserQueryKeys = typeof queryKeys.user;
export type AuthQueryKeys = typeof queryKeys.auth;
