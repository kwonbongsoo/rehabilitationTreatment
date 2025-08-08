/**
 * useProductImages 압축 기능 테스트
 *
 * 이미지 압축, 파일 크기 검증, 진행률 추적을 테스트합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useProductImages } from '../useProductImages';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';
import React from 'react';

// browser-image-compression 모킹
jest.mock('browser-image-compression');
const mockImageCompression = imageCompression as jest.MockedFunction<typeof imageCompression>;

// react-toastify 모킹
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// URL.createObjectURL 모킹
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

describe('useProductImages - 압축 기능', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('파일 크기 검증', () => {
    it('10MB 초과 파일을 거부해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());

      // 11MB 파일 생성
      const largeFile = new File([''], 'large.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

      const mockEvent = {
        target: { files: [largeFile], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(toast.error).toHaveBeenCalledWith('large.jpg: 파일 크기가 10MB를 초과합니다 (11.0MB)');
      expect(result.current.images).toHaveLength(0);
    });

    it('이미지가 아닌 파일을 거부해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());

      const textFile = new File(['content'], 'document.txt', {
        type: 'text/plain',
      });

      const mockEvent = {
        target: { files: [textFile], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(toast.error).toHaveBeenCalledWith('document.txt: 이미지 파일만 업로드 가능합니다.');
      expect(result.current.images).toHaveLength(0);
    });
  });

  describe('이미지 압축', () => {
    it('이미지를 성공적으로 압축해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());

      // Mock File 객체 생성 (크기 속성을 제대로 모킹)
      const createMockFile = (name: string, type: string, size: number): File => {
        // 파일 크기에 맞는 내용 생성 (실제 구현에서 new File([compressedFile]로 사용하므로)
        const content = new ArrayBuffer(size);
        const file = new File([content], name, { type });
        return file;
      };

      const originalFile = createMockFile('test.jpg', 'image/jpeg', 5 * 1024 * 1024);
      // 압축 결과는 webp로 반환되도록 모킹 (옵션 fileType: 'image/webp'와 일치)
      const compressedFile = createMockFile('test.webp', 'image/webp', 1.5 * 1024 * 1024);

      mockImageCompression.mockResolvedValue(compressedFile);

      const mockEvent = {
        target: { files: [originalFile], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(mockImageCompression).toHaveBeenCalledWith(
        originalFile,
        expect.objectContaining({
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          preserveExif: false,
          onProgress: expect.any(Function),
        }),
      );

      expect(result.current.images).toHaveLength(1);

      // File 객체 속성별 검증 (랜덤 파일명이므로 패턴으로 검증)
      const uploadedFile = result.current.images[0];
      expect(uploadedFile).toBeDefined();
      // 옵션에 따라 webp로 반환되어야 한다
      expect(uploadedFile?.type).toBe('image/webp');
      expect(uploadedFile?.name).toMatch(/^product_image_\d+_[a-z0-9]+\.webp$/);

      // 토스트 메시지 검증 (원본 파일명 사용)
      expect(toast.success).toHaveBeenCalledWith('test.jpg 압축 완료: 5.0MB → 1.5MB');
    });

    it('압축 실패시 에러를 처리해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());

      const originalFile = new File([''], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(originalFile, 'size', { value: 3 * 1024 * 1024 });

      mockImageCompression.mockRejectedValue(new Error('Compression failed'));

      const mockEvent = {
        target: { files: [originalFile], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(toast.error).toHaveBeenCalledWith('test.jpg: 이미지 압축에 실패했습니다.');
      expect(result.current.images).toHaveLength(0);
    });

    it('압축 중 상태를 올바르게 관리해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());

      // Mock File 헬퍼 함수
      const createMockFile = (name: string, type: string, size: number): File => {
        const content = new ArrayBuffer(size);
        const file = new File([content], name, { type });
        return file;
      };

      const originalFile = createMockFile('test.jpg', 'image/jpeg', 3 * 1024 * 1024);

      let progressCallback: ((progress: number) => void) | undefined;
      mockImageCompression.mockImplementation((file, options) => {
        progressCallback = options.onProgress;
        return new Promise((resolve) => {
          setTimeout(() => {
            const compressedFile = createMockFile('test.webp', 'image/webp', 1 * 1024 * 1024);
            resolve(compressedFile);
          }, 100);
        });
      });

      const mockEvent = {
        target: { files: [originalFile], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      let compressionPromise: Promise<void>;
      act(() => {
        compressionPromise = result.current.handleImageUpload(
          mockEvent,
        ) as unknown as Promise<void>;
      });

      // 압축 시작 상태 확인
      expect(result.current.isCompressing).toBe(true);

      // 진행률 업데이트 테스트
      act(() => {
        progressCallback!(50);
      });
      expect(Object.keys(result.current.compressionProgress).length).toBeGreaterThan(0);

      await act(async () => {
        await compressionPromise;
      });

      // 압축 완료 상태 확인
      expect(result.current.isCompressing).toBe(false);
      expect(Object.keys(result.current.compressionProgress)).toHaveLength(0);

      // 최종 파일 검증 (랜덤 파일명 패턴 확인)
      expect(result.current.images).toHaveLength(1);
      expect(result.current.images[0]?.name).toMatch(/^product_image_\d+_[a-z0-9]+\.webp$/);
    });
  });

  describe('5개 이미지 제한', () => {
    it('5개 초과시 업로드를 거부해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());

      // Mock File 헬퍼 함수
      const createMockFile = (name: string, type: string, size: number): File => {
        const content = new ArrayBuffer(size);
        const file = new File([content], name, { type });
        return file;
      };

      // 먼저 5개 이미지 순차적으로 추가 (overlapping act 방지)
      const existingFiles = Array.from({ length: 5 }, (_, i) =>
        createMockFile(`existing${i}.jpg`, 'image/jpeg', 1 * 1024 * 1024),
      );

      mockImageCompression.mockImplementation((file) => Promise.resolve(file));

      /* eslint-disable no-await-in-loop */
      for (const file of existingFiles) {
        await act(async () => {
          await result.current.handleImageUpload({
            target: { files: [file], value: '' },
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        });
      }
      /* eslint-enable no-await-in-loop */

      expect(result.current.images).toHaveLength(5);

      // 6번째 이미지 추가 시도
      const newFile = createMockFile('sixth.jpg', 'image/jpeg', 1 * 1024 * 1024);
      const mockEvent = {
        target: { files: [newFile], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(toast.error).toHaveBeenCalledWith('최대 5개의 이미지만 업로드할 수 있습니다.');
      expect(result.current.images).toHaveLength(5);
    });
  });
});
