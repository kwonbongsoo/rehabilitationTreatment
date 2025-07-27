/**
 * 사용자 관련 API 서비스
 * - 사용자 정보 조회/수정
 * - 세션 관리
 * - 인증 상태 확인
 */

import { authApiClient, kongApiClient } from '@/lib/api';
import type { UserResponse, SessionInfoResponse, RegisterRequest } from '@/domains/auth/types/auth';
import type { UserUpdateRequest, Address, AddressRequest } from '@/domains/auth/types/user';

export class UserService {
  /**
   * 현재 사용자 세션 정보 조회
   */
  static async getCurrentUser(): Promise<UserResponse> {
    const response = await authApiClient.get<SessionInfoResponse>('/auth/session-info');
    return response.data;
  }

  /**
   * 사용자 정보 업데이트
   */
  static async updateUser(data: UserUpdateRequest): Promise<UserResponse> {
    return authApiClient.put<UserResponse>('/auth/profile', data);
  }

  /**
   * 인증 상태 확인
   */
  static async checkAuthStatus(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 회원가입 (Kong Gateway 경유)
   */
  static async register(userData: RegisterRequest, idempotencyKey?: string): Promise<UserResponse> {
    const requestData = {
      id: userData.id,
      password: userData.password,
      name: userData.name,
      email: userData.email,
    };

    const response = await kongApiClient.post<{
      success: boolean;
      data: UserResponse;
      message?: string;
    }>('/members', requestData, {
      idempotencyKey: idempotencyKey || '',
    });

    return response.data;
  }

  /**
   * 회원 정보 조회 (Kong Gateway 경유)
   */
  static async getMember(id: string): Promise<UserResponse> {
    return kongApiClient.get<UserResponse>(`/members/${id}`);
  }

  /**
   * 회원 정보 수정 (Kong Gateway 경유)
   */
  static async updateMember(id: string, data: Partial<UserResponse>): Promise<UserResponse> {
    return kongApiClient.put<UserResponse>(`/members/${id}`, data);
  }

  /**
   * 회원 탈퇴 (Kong Gateway 경유)
   */
  static async deleteMember(id: string): Promise<void> {
    return kongApiClient.delete<void>(`/members/${id}`);
  }

  // ========== 주소 관리 ==========

  /**
   * 사용자 주소 목록 조회
   */
  static async getAddresses(): Promise<Address[]> {
    return authApiClient.get<Address[]>('/auth/addresses');
  }

  /**
   * 주소 추가
   */
  static async addAddress(address: AddressRequest): Promise<Address> {
    return authApiClient.post<Address>('/auth/addresses', address);
  }

  /**
   * 주소 수정
   */
  static async updateAddress(id: string, address: Partial<AddressRequest>): Promise<Address> {
    return authApiClient.put<Address>(`/auth/addresses/${id}`, address);
  }

  /**
   * 주소 삭제
   */
  static async deleteAddress(id: string): Promise<void> {
    return authApiClient.delete<void>(`/auth/addresses/${id}`);
  }

  /**
   * 기본 주소 설정
   */
  static async setDefaultAddress(id: string): Promise<void> {
    return authApiClient.patch<void>(`/auth/addresses/${id}/default`);
  }

  // ========== 편의 메서드 ==========

  /**
   * 사용자 프로필 완성도 확인
   */
  static async getProfileCompleteness(): Promise<{
    percentage: number;
    missingFields: string[];
  }> {
    const user = await this.getCurrentUser();
    const requiredFields = ['name', 'email', 'phoneNumber', 'profileImageUrl'];
    const missingFields = requiredFields.filter((field) => !user[field as keyof UserResponse]);

    return {
      percentage: Math.round(
        ((requiredFields.length - missingFields.length) / requiredFields.length) * 100,
      ),
      missingFields,
    };
  }

  /**
   * 이메일 중복 확인
   */
  static async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      await authApiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 사용자 ID 중복 확인
   */
  static async checkUserIdAvailability(userId: string): Promise<boolean> {
    try {
      await kongApiClient.get(`/members/check-id?id=${encodeURIComponent(userId)}`);
      return true;
    } catch {
      return false;
    }
  }
}
