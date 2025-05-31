/**
 * 멤버 기본 정보 인터페이스
 */
export interface MemberBase {
    id: string;
    email: string;
    name: string;
}

/**
 * 멤버 서비스에서 반환하는 멤버 상세 정보
 */
export interface MemberDetail extends MemberBase {
    createdAt: string;
    updatedAt: string;
}

/**
 * 멤버 서비스 API 응답 형식
 */
export interface MemberResponse {
    success: boolean;
    member: MemberDetail;
    message?: string;
}

/**
 * 멤버 인증 요청 형식
 */
export interface MemberAuthRequest {
    id: string;
    password: string;
}