/**
 * useProductImages 훅 테스트
 *
 * 상품 이미지 관리 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 URL 객체와 alert을 모킹합니다.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useProductImages } from '../useProductImages';

// URL.createObjectURL과 URL.revokeObjectURL 모킹
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

// alert 모킹
const mockAlert = jest.fn();
global.alert = mockAlert;

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
    mockAlert.mockClear();

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
    it('단일 이미지를 올바르게 업로드해야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test1.jpg');
      const mockEvent = createMockEvent([mockFile]);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.images).toHaveLength(1);
      expect(result.current.images[0]).toBe(mockFile);
      expect(result.current.imagePreviews).toHaveLength(1);
      expect(result.current.imagePreviews[0]).toBe('blob://mock-url-test1.jpg');
    });

    it('여러 이미지를 동시에 업로드할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const mockEvent = createMockEvent(mockFiles);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.images).toHaveLength(3);
      expect(result.current.imagePreviews).toHaveLength(3);
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(3);
    });

    it('기존 이미지에 새 이미지를 추가할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductImages());

      // 첫 번째 이미지 업로드
      const firstFile = createMockFile('first.jpg');
      const firstEvent = createMockEvent([firstFile]);

      act(() => {
        result.current.handleImageUpload(firstEvent);
      });

      // 두 번째 이미지 업로드
      const secondFile = createMockFile('second.jpg');
      const secondEvent = createMockEvent([secondFile]);

      act(() => {
        result.current.handleImageUpload(secondEvent);
      });

      expect(result.current.images).toHaveLength(2);
      expect(result.current.images[0]).toBe(firstFile);
      expect(result.current.images[1]).toBe(secondFile);
    });

    it('5개 초과 업로드시 경고 메시지가 표시되고 업로드가 차단되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());

      // 먼저 4개 이미지 업로드
      const initialFiles = [
        createMockFile('1.jpg'),
        createMockFile('2.jpg'),
        createMockFile('3.jpg'),
        createMockFile('4.jpg'),
      ];
      const initialEvent = createMockEvent(initialFiles);

      act(() => {
        result.current.handleImageUpload(initialEvent);
      });

      expect(result.current.images).toHaveLength(4);

      // 추가로 2개 더 업로드 시도 (총 6개)
      const additionalFiles = [createMockFile('5.jpg'), createMockFile('6.jpg')];
      const additionalEvent = createMockEvent(additionalFiles);

      act(() => {
        result.current.handleImageUpload(additionalEvent);
      });

      expect(mockAlert).toHaveBeenCalledWith('최대 5개의 이미지만 업로드할 수 있습니다.');
      expect(result.current.images).toHaveLength(4); // 기존 4개 유지
      expect(additionalEvent.target.value).toBe(''); // input value 클리어
    });

    it('파일이 선택되지 않았을 때 정상적으로 처리되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockEvent = createMockEvent([]);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.images).toHaveLength(0);
      expect(result.current.imagePreviews).toHaveLength(0);
      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it('업로드 후 input value가 클리어되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      expect(mockEvent.target.value).toBe('');
    });
  });

  describe('이미지 제거', () => {
    it('특정 인덱스의 이미지가 제거되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const mockEvent = createMockEvent(mockFiles);

      // 먼저 이미지들 업로드
      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      // 인덱스 1의 이미지 제거
      act(() => {
        result.current.removeImage(1);
      });

      expect(result.current.images).toHaveLength(2);
      expect(result.current.images[0]?.name).toBe('test1.jpg');
      expect(result.current.images[1]?.name).toBe('test3.jpg');
      expect(result.current.imagePreviews).toHaveLength(2);
    });

    it('이미지 제거시 해당 preview URL이 해제되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      // 먼저 이미지 업로드
      act(() => {
        result.current.handleImageUpload(mockEvent);
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

    it('첫 번째 이미지를 제거할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('first.jpg'), createMockFile('second.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      act(() => {
        result.current.removeImage(0);
      });

      expect(result.current.images).toHaveLength(1);
      expect(result.current.images[0]?.name).toBe('second.jpg');
    });

    it('마지막 이미지를 제거할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('first.jpg'), createMockFile('last.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      act(() => {
        result.current.removeImage(1);
      });

      expect(result.current.images).toHaveLength(1);
      expect(result.current.images[0]?.name).toBe('first.jpg');
    });

    it('존재하지 않는 인덱스 제거시 에러가 발생하지 않아야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      act(() => {
        result.current.handleImageUpload(mockEvent);
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
    it('모든 이미지와 미리보기가 제거되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const mockEvent = createMockEvent(mockFiles);

      // 먼저 이미지들 업로드
      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.images).toHaveLength(3);

      // 초기화
      act(() => {
        result.current.resetImages();
      });

      expect(result.current.images).toHaveLength(0);
      expect(result.current.imagePreviews).toHaveLength(0);
    });

    it('초기화시 모든 preview URL이 해제되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('test1.jpg'), createMockFile('test2.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      // 먼저 이미지들 업로드
      act(() => {
        result.current.handleImageUpload(mockEvent);
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
    it('핸들러 함수들이 의존성 변경에 따라 적절히 재생성되어야 한다', () => {
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

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      // images 상태가 변경되었으므로 의존하는 핸들러들이 재생성됨
      expect(result.current.handleImageUpload).not.toBe(initialHandlers.handleImageUpload);
      expect(result.current.removeImage).not.toBe(initialHandlers.removeImage);
    });

    it('상태 불변성이 유지되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      const originalImages = result.current.images;
      const originalPreviews = result.current.imagePreviews;

      // 새 이미지 추가
      const secondFile = createMockFile('test2.jpg');
      const secondEvent = createMockEvent([secondFile]);

      act(() => {
        result.current.handleImageUpload(secondEvent);
      });

      // 새로운 배열이 생성되어야 함
      expect(result.current.images).not.toBe(originalImages);
      expect(result.current.imagePreviews).not.toBe(originalPreviews);
    });
  });

  describe('URL 생성 및 해제', () => {
    it('각 파일에 대해 createObjectURL이 호출되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFiles = [createMockFile('test1.jpg'), createMockFile('test2.jpg')];
      const mockEvent = createMockEvent(mockFiles);

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFiles[0]);
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFiles[1]);
    });

    it('preview URL 생성 결과가 올바르게 저장되어야 한다', () => {
      const { result } = renderHook(() => useProductImages());
      const mockFile = createMockFile('test.jpg');
      const mockEvent = createMockEvent([mockFile]);

      // createObjectURL이 특정 URL을 반환하도록 설정
      mockCreateObjectURL.mockReturnValue('blob://specific-url');

      act(() => {
        result.current.handleImageUpload(mockEvent);
      });

      expect(result.current.imagePreviews[0]).toBe('blob://specific-url');
    });
  });
});
