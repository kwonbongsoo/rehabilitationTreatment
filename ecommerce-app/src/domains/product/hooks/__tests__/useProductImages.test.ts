/**
 * useProductImages 훅 테스트
 *
 * 상품 이미지 관리 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 URL 객체와 관련 모듈들을 모킹합니다.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductImages } from '../useProductImages';

// browser-image-compression 모킹
jest.mock('browser-image-compression', () => {
  return jest
    .fn()
    .mockImplementation((file: File) => {
      // 랜덤 파일명 생성 시뮬레이션
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const extension = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '.jpg';
      const randomFileName = `product_image_${timestamp}_${random}${extension}`;
      
      return Promise.resolve(new File(['compressed'], randomFileName, { type: file.type }));
    });
});

// react-toastify 모킹
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// URL.createObjectURL과 URL.revokeObjectURL 모킹
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

// URL 전역 객체 모킹
global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
} as any;

describe('useProductImages', () => {
  const createMockFile = (name: string, type = 'image/jpeg'): File => {
    return new File(['mock file content'], name, { type });
  };

  const createMockEvent = (files: File[]): React.ChangeEvent<HTMLInputElement> => {
    const mockTarget = {
      files: files.length > 0 ? files : null,
      value: '',
    } as HTMLInputElement;

    return {
      target: mockTarget,
    } as React.ChangeEvent<HTMLInputElement>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // createObjectURL이 고유한 URL을 반환하도록 설정
    mockCreateObjectURL.mockImplementation((file: File) => `blob://mock-url-${file.name}`);
  });

  describe('초기 상태', () => {
    it('빈 배열로 초기화되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());

      expect(result.current.images).toEqual([]);
      expect(result.current.imagePreviews).toEqual([]);
    });

    it('모든 핸들러 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());

      expect(typeof result.current.handleImageUpload).toBe('function');
      expect(typeof result.current.removeImage).toBe('function');
      expect(typeof result.current.resetImages).toBe('function');
    });
  });

  describe('이미지 업로드', () => {
    it('단일 이미지를 올바르게 업로드해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test1.jpg');
      const mockEvent = createMockEvent([mockFile]);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(1);
      });

      await waitFor(() => {
        // 랜덤 파일명이 생성되었는지 확인
        const fileName = result.current.images[0]?.name;
        expect(fileName).toMatch(/^product_image_\d+_[a-z0-9]+\.jpg$/);
        expect(fileName).not.toBe('test1.jpg'); // 원본 파일명과 다름
      });

      await waitFor(() => {
        expect(result.current.imagePreviews).toHaveLength(1);
      });
    });

    it('여러 이미지를 동시에 업로드할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const mockEvent = createMockEvent(mockFiles);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(3);
      });

      await waitFor(() => {
        expect(result.current.imagePreviews).toHaveLength(3);
      });

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(3);
      });
    });

    it('기존 이미지에 새 이미지를 추가할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());

      // 첫 번째 이미지 업로드
      const firstFile = createMockFile('first.jpg');
      const firstEvent = createMockEvent([firstFile]);

      await act(async () => {
        await result.current.handleImageUpload(firstEvent);
      });

      // 두 번째 이미지 업로드
      const secondFile = createMockFile('second.jpg');
      const secondEvent = createMockEvent([secondFile]);

      await act(async () => {
        await result.current.handleImageUpload(secondEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(2);
      });

      await waitFor(() => {
        // 두 이미지 모두 랜덤 파일명이 생성되었는지 확인
        const firstFileName = result.current.images[0]?.name;
        const secondFileName = result.current.images[1]?.name;
        
        expect(firstFileName).toMatch(/^product_image_\d+_[a-z0-9]+\.jpg$/);
        expect(secondFileName).toMatch(/^product_image_\d+_[a-z0-9]+\.jpg$/);
        expect(firstFileName).not.toBe('first.jpg');
        expect(secondFileName).not.toBe('second.jpg');
        expect(firstFileName).not.toBe(secondFileName); // 서로 다른 파일명
      });
    });

    it('5개 초과 업로드시 경고 메시지가 표시되고 업로드가 차단되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const { toast } = require('react-toastify');

      // 먼저 4개 이미지 업로드
      const initialFiles = [
        createMockFile('1.jpg'),
        createMockFile('2.jpg'),
        createMockFile('3.jpg'),
        createMockFile('4.jpg'),
      ];
      const initialEvent = createMockEvent(initialFiles);

      await act(async () => {
        await result.current.handleImageUpload(initialEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(4);
      });

      // 추가로 2개 더 업로드 시도 (총 6개)
      const additionalFiles = [createMockFile('5.jpg'), createMockFile('6.jpg')];
      const additionalEvent = createMockEvent(additionalFiles);

      await act(async () => {
        await result.current.handleImageUpload(additionalEvent);
      });

      expect(toast.error).toHaveBeenCalledWith('최대 5개의 이미지만 업로드할 수 있습니다.');
      expect(result.current.images).toHaveLength(4); // 기존 4개 유지
      expect(additionalEvent.target.value).toBe(''); // input value 클리어
    });

    it('파일이 선택되지 않았을 때 정상적으로 처리되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockEvent = createMockEvent([]);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.images).toHaveLength(0);
      expect(result.current.imagePreviews).toHaveLength(0);
      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it('업로드 후 input value가 클리어되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      expect(mockEvent.target.value).toBe('');
    });
  });

  describe('이미지 제거', () => {
    it('특정 인덱스의 이미지가 제거되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const mockEvent = createMockEvent(mockFiles);

      // 먼저 이미지들 업로드
      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(3);
      });

      // 파일명들을 미리 저장 (랜덤 생성되므로)
      const fileNames = result.current.images.map(img => img.name);

      // 인덱스 1의 이미지 제거
      act(() => {
        result.current.removeImage(1);
      });

      expect(result.current.images).toHaveLength(2);
      expect(result.current.images[0]?.name).toBe(fileNames[0]); // 첫 번째 유지
      expect(result.current.images[1]?.name).toBe(fileNames[2]); // 세 번째가 두 번째 자리로
      expect(result.current.imagePreviews).toHaveLength(2);
    });

    it('이미지 제거시 해당 preview URL이 해제되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      // 먼저 이미지 업로드
      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(1);
      });

      const previewUrl = result.current.imagePreviews[0];

      // 이미지 제거
      act(() => {
        result.current.removeImage(0);
      });

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(previewUrl);
      expect(result.current.images).toHaveLength(0);
      expect(result.current.imagePreviews).toHaveLength(0);
    });

    it('첫 번째 이미지를 제거할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('first.jpg'), createMockFile('second.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(2);
      });

      // 파일명들을 미리 저장 (랜덤 생성되므로)
      const secondFileName = result.current.images[1]?.name;

      act(() => {
        result.current.removeImage(0);
      });

      expect(result.current.images).toHaveLength(1);
      expect(result.current.images[0]?.name).toBe(secondFileName);
    });

    it('마지막 이미지를 제거할 수 있어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('first.jpg'), createMockFile('last.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(2);
      });

      // 파일명들을 미리 저장 (랜덤 생성되므로)
      const firstFileName = result.current.images[0]?.name;

      act(() => {
        result.current.removeImage(1);
      });

      expect(result.current.images).toHaveLength(1);
      expect(result.current.images[0]?.name).toBe(firstFileName);
    });

    it('존재하지 않는 인덱스 제거시 에러가 발생하지 않아야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(1);
      });

      expect(() => {
        act(() => {
          result.current.removeImage(10);
        });
      }).not.toThrow();

      expect(result.current.images).toHaveLength(1);
    });
  });

  describe('이미지 초기화', () => {
    it('모든 이미지와 미리보기가 제거되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const mockEvent = createMockEvent(mockFiles);

      // 먼저 이미지들 업로드
      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(3);
      });

      // 초기화
      act(() => {
        result.current.resetImages();
      });

      expect(result.current.images).toHaveLength(0);
      expect(result.current.imagePreviews).toHaveLength(0);
    });

    it('초기화시 모든 preview URL이 해제되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('test1.jpg'), createMockFile('test2.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      // 먼저 이미지들 업로드
      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(2);
      });

      const previewUrls = [...result.current.imagePreviews];

      // 초기화
      act(() => {
        result.current.resetImages();
      });

      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(previewUrls[0]);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(previewUrls[1]);
    });

    it('빈 상태에서 초기화해도 에러가 발생하지 않아야 한다', () => {
      const { result } = renderHook(() => useProductImages());

      expect(() => {
        act(() => {
          result.current.resetImages();
        });
      }).not.toThrow();

      expect(result.current.images).toHaveLength(0);
      expect(result.current.imagePreviews).toHaveLength(0);
    });
  });

  describe('메모리 및 성능', () => {
    it('핸들러 함수들이 의존성 변경에 따라 적절히 재생성되어야 한다', async () => {
      const { result, rerender } = renderHook(() => useProductImages());

      const initialHandlers = {
        handleImageUpload: result.current.handleImageUpload,
        removeImage: result.current.removeImage,
        resetImages: result.current.resetImages,
      };

      // 이미지 상태가 변경되지 않으면 핸들러가 재사용됨
      rerender();
      expect(result.current.resetImages).toBe(initialHandlers.resetImages);

      // 이미지 추가로 상태 변경
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(1);
      });

      // images 상태가 변경되었으므로 의존하는 핸들러들이 재생성됨
      expect(result.current.handleImageUpload).not.toBe(initialHandlers.handleImageUpload);
      expect(result.current.removeImage).not.toBe(initialHandlers.removeImage);
    });

    it('상태 불변성이 유지되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(1);
      });

      const originalImages = result.current.images;
      const originalPreviews = result.current.imagePreviews;

      // 새 이미지 추가
      const secondFile = createMockFile('test2.jpg');
      const secondEvent = createMockEvent([secondFile]);

      await act(async () => {
        await result.current.handleImageUpload(secondEvent);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(2);
      });

      // 새로운 배열이 생성되어야 함
      expect(result.current.images).not.toBe(originalImages);
      expect(result.current.imagePreviews).not.toBe(originalPreviews);
    });
  });

  describe('URL 생성 및 해제', () => {
    it('각 파일에 대해 createObjectURL이 호출되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('test1.jpg'), createMockFile('test2.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
      });
    });

    it('preview URL 생성 결과가 올바르게 저장되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      // createObjectURL이 특정 URL을 반환하도록 설정
      mockCreateObjectURL.mockReturnValue('blob://specific-url');

      await act(async () => {
        await result.current.handleImageUpload(mockEvent);
      });

      await waitFor(() => {
        expect(result.current.imagePreviews[0]).toBe('blob://specific-url');
      });
    });
  });

  describe('랜덤 파일명 생성', () => {
    it('동일한 파일을 여러 번 업로드해도 다른 파일명이 생성되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const sameFileName = 'duplicate.jpg';
      
      // 첫 번째 업로드
      const firstFile = createMockFile(sameFileName);
      const firstEvent = createMockEvent([firstFile]);
      
      await act(async () => {
        await result.current.handleImageUpload(firstEvent);
      });
      
      await waitFor(() => {
        expect(result.current.images).toHaveLength(1);
      });
      
      const firstName = result.current.images[0]?.name;
      
      // 짧은 시간 후 같은 파일 다시 업로드
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const secondFile = createMockFile(sameFileName);
      const secondEvent = createMockEvent([secondFile]);
      
      await act(async () => {
        await result.current.handleImageUpload(secondEvent);
      });
      
      await waitFor(() => {
        expect(result.current.images).toHaveLength(2);
      });
      
      const secondName = result.current.images[1]?.name;
      
      // 두 파일명이 서로 달라야 함
      expect(firstName).not.toBe(secondName);
      expect(firstName).toMatch(/^product_image_\d+_[a-z0-9]+\.jpg$/);
      expect(secondName).toMatch(/^product_image_\d+_[a-z0-9]+\.jpg$/);
    });
    
    it('파일 확장자가 올바르게 유지되어야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const testFiles = [
        createMockFile('test.png', 'image/png'),
        createMockFile('test.gif', 'image/gif'),
        createMockFile('test.webp', 'image/webp'),
        createMockFile('no-extension', 'image/jpeg'), // 확장자 없는 경우
      ];
      
      for (const file of testFiles) {
        const event = createMockEvent([file]);
        await act(async () => {
          await result.current.handleImageUpload(event);
        });
      }
      
      await waitFor(() => {
        expect(result.current.images).toHaveLength(4);
      });
      
      const fileNames = result.current.images.map(img => img.name);
      
      expect(fileNames[0]).toMatch(/^product_image_\d+_[a-z0-9]+\.png$/);
      expect(fileNames[1]).toMatch(/^product_image_\d+_[a-z0-9]+\.gif$/);
      expect(fileNames[2]).toMatch(/^product_image_\d+_[a-z0-9]+\.webp$/);
      expect(fileNames[3]).toMatch(/^product_image_\d+_[a-z0-9]+\.jpg$/); // 기본 확장자
    });
    
    it('파일명이 유니크하고 예측 불가능해야 한다', async () => {
      const { result } = renderHook(() => useProductImages());
      const fileNames: string[] = [];
      
      // 5개의 동일한 파일을 업로드하여 파일명 패턴 확인
      for (let i = 0; i < 5; i++) {
        const file = createMockFile('test.jpg');
        const event = createMockEvent([file]);
        
        await act(async () => {
          await result.current.handleImageUpload(event);
        });
        
        await waitFor(() => {
          expect(result.current.images).toHaveLength(i + 1);
        });
        
        const latestFileName = result.current.images[i]?.name;
        fileNames.push(latestFileName!);
        
        // 약간의 지연 (타임스탬프 차이를 위해)
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      // 모든 파일명이 유니크한지 확인
      const uniqueNames = new Set(fileNames);
      expect(uniqueNames.size).toBe(5);
      
      // 모든 파일명이 올바른 패턴을 따르는지 확인
      fileNames.forEach(name => {
        expect(name).toMatch(/^product_image_\d+_[a-z0-9]+\.jpg$/);
      });
    });
  });
});
