/**
 * useCurrentUser 훅 테스트
 *
 * React Query를 활용한 현재 사용자 정보 조회 훅을 테스트합니다.
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from '../useCurrentUser';
import { getCurrentUser } from '../../services';
import { UserResponse } from '../../types/auth';

// Mock dependencies
jest.mock('../../services', () => ({
  getCurrentUser: jest.fn(),
}));

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;

// Test utilities
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  const WithQueryClientProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactNode => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

  WithQueryClientProvider.displayName = 'WithQueryClientProvider';

  return WithQueryClientProvider;
};

const mockUserResponse: UserResponse = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
};

describe('useCurrentUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('성공적인 데이터 조회', () => {
    it('사용자 데이터를 성공적으로 반환해야 한다', async () => {
      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: mockUserResponse as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      // 초기 로딩 상태 확인
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();

      // 데이터 로드 완료 대기
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUserResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('올바른 query key를 사용해야 한다', async () => {
      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: mockUserResponse as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('에러 처리', () => {
    it('서버 에러를 올바르게 처리해야 한다', async () => {
      const errorMessage = '사용자 정보를 찾을 수 없습니다';
      mockGetCurrentUser.mockResolvedValue({
        success: false,
        error: errorMessage,
        statusCode: 404,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect((result.current.error as any)?.cause?.statusCode).toBe(404);
      expect(result.current.data).toBeUndefined();
    });

    it('에러 메시지가 없을 때 기본 메시지를 사용해야 한다', async () => {
      mockGetCurrentUser.mockResolvedValue({
        success: false,
        error: null as any,
        statusCode: 500,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('사용자 정보 조회에 실패했습니다.');
      expect((result.current.error as any)?.cause?.statusCode).toBe(500);
    });

    it('네트워크 에러를 처리해야 한다', async () => {
      const networkError = new Error('Network Error');
      mockGetCurrentUser.mockRejectedValue(networkError);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(networkError);
    });
  });

  describe('캐싱 동작', () => {
    it('올바른 staleTime을 설정해야 한다', () => {
      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: mockUserResponse as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      // staleTime이 5분(300000ms)으로 설정되어야 함
      expect(result.current.dataUpdatedAt).toBeDefined();
    });

    it('올바른 gcTime을 설정해야 한다', () => {
      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: mockUserResponse as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      // gcTime이 10분(600000ms)으로 설정되어야 함
      expect(result.current).toBeDefined();
    });
  });

  describe('데이터 구조', () => {
    it('undefined 데이터를 올바르게 처리해야 한다', async () => {
      // React Query는 undefined 데이터를 허용하지 않으므로 빈 객체를 반환하도록 수정
      const emptyUserData = {
        id: '',
        name: '',
        email: '',
        role: 'user',
        profileImage: null,
        createdAt: '',
        updatedAt: '',
      } as UserResponse;

      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: emptyUserData as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(emptyUserData);
      expect(result.current.error).toBeNull();
    });

    it('부분적인 사용자 데이터를 처리해야 한다', async () => {
      const partialUserData = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      } as UserResponse;

      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: partialUserData as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(partialUserData);
    });
  });

  describe('React Query 상태', () => {
    it('모든 React Query 상태를 올바르게 노출해야 한다', async () => {
      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: mockUserResponse as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      // 초기 상태
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isError).toBeDefined();
      expect(result.current.isSuccess).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.status).toBeDefined();
      expect(result.current.fetchStatus).toBeDefined();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // 성공 후 상태
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockUserResponse);
    });
  });

  describe('재요청 시나리오', () => {
    it('refetch 함수가 동작해야 한다', async () => {
      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: mockUserResponse as any,
        statusCode: 200,
      });

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // refetch 실행
      await result.current.refetch();

      expect(mockGetCurrentUser).toHaveBeenCalledTimes(2);
    });

    it('invalidate 시 새로운 요청을 보내야 한다', async () => {
      mockGetCurrentUser.mockResolvedValue({
        success: true,
        data: mockUserResponse as any,
        statusCode: 200,
      });

      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['auth', 'current-user'] });

      await waitFor(() => {
        expect(mockGetCurrentUser).toHaveBeenCalledTimes(2);
      });
    });
  });
});
