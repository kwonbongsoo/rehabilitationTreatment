/**
 * 사용자 모델 (전체 정보)
 */
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string; // firstName + lastName 조합
    phoneNumber?: string;
    profileImageUrl?: string;
    role: 'customer' | 'admin' | 'guest';
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    preferences: UserPreferences;
    addresses: Address[];
    defaultAddressId?: string;
    defaultPaymentMethodId?: string;
    wishlist: string[]; // 위시리스트에 있는 상품 ID 목록
    orders: {
        count: number;
        recentOrderId?: string;
    };
    meta: {
        accountAge: number; // 일수
        totalSpent?: number;
        loyaltyPoints?: number;
        loyaltyTier?: 'standard' | 'silver' | 'gold' | 'platinum';
    };
}

/**
 * 사용자 정보 업데이트 요청 모델
 */
export interface UserUpdateRequest {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profileImageUrl?: string;
    preferences?: Partial<UserPreferences>;
    defaultAddressId?: string;
    defaultPaymentMethodId?: string;
}

/**
 * 사용자 주소 모델
 */
export interface Address {
    id: string;
    type: 'shipping' | 'billing' | 'both';
    isDefault: boolean;
    name: string; // 주소 별칭 (예: "집", "회사")
    recipientName: string;
    phoneNumber?: string;
    line1: string; // 상세주소 1
    line2?: string; // 상세주소 2
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    countryCode: string; // ISO 국가 코드 (예: "KR")
    instructions?: string; // 배송 지침
    createdAt: string;
    updatedAt: string;
}

/**
 * 사용자 환경 설정 모델
 */
export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    currency: string; // 기본 통화 (예: "KRW")
    language: string; // 언어 설정 (예: "ko-KR")
    receiveEmailMarketing: boolean;
    receiveSmsMarketing: boolean;
    receivePushNotifications: boolean;
    notificationSettings: {
        orderUpdates: boolean;
        promotions: boolean;
        accountAlerts: boolean;
        priceDrop: boolean;
        backInStock: boolean;
    };
}

/**
 * 사용자 주소 생성/업데이트 요청 모델
 */
export interface AddressRequest {
    type: 'shipping' | 'billing' | 'both';
    isDefault?: boolean;
    name: string;
    recipientName: string;
    phoneNumber?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    countryCode: string;
    instructions?: string;
}

/**
 * 사용자 비공개 정보 (앱 내부용)
 */
export interface UserPrivateInfo {
    id: string;
    email: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    hasPassword: boolean;
    twoFactorEnabled: boolean;
    authMethods: ('password' | 'google' | 'facebook' | 'apple')[];
    lastPasswordChangeAt?: string;
    passwordExpiresAt?: string;
    accountStatus: 'active' | 'suspended' | 'locked';
    failedLoginAttempts: number;
    marketingConsent: {
        email: boolean;
        sms: boolean;
        push: boolean;
        consentedAt?: string;
    };
}