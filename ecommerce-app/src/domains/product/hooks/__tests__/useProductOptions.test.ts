/**
 * useProductOptions 훅 테스트
 * 
 * 상품 옵션 관리 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 독립적인 테스트 환경을 구성합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useProductOptions } from '../useProductOptions';
import type { ProductOption } from '@/domains/product/types/product';

describe('useProductOptions', () => {
  const mockOption: ProductOption = {
    optionType: 'color',
    optionName: '색상',
    optionValue: 'red',
    additionalPrice: 1000,
    stock: 10,
    sku: 'RED-001',
    isActive: true,
    sortOrder: 0,
  };

  const mockInitialOptions: ProductOption[] = [
    mockOption,
    {
      optionType: 'size',
      optionName: '크기',
      optionValue: 'L',
      additionalPrice: 2000,
      stock: 5,
      sku: 'SIZE-L',
      isActive: true,
      sortOrder: 1,
    },
  ];

  describe('초기 상태', () => {
    it('초기 옵션 없이 생성할 때 빈 배열이 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions());

      expect(result.current.options).toEqual([]);
    });

    it('초기 옵션이 제공될 때 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      expect(result.current.options).toEqual(mockInitialOptions);
      expect(result.current.options).toHaveLength(2);
    });

    it('모든 핸들러 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions());

      expect(typeof result.current.handleOptionChange).toBe('function');
      expect(typeof result.current.addOption).toBe('function');
      expect(typeof result.current.removeOption).toBe('function');
      expect(typeof result.current.moveOption).toBe('function');
      expect(typeof result.current.resetOptions).toBe('function');
    });
  });

  describe('옵션 추가', () => {
    it('새 옵션이 올바른 기본값으로 추가되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions());

      act(() => {
        result.current.addOption();
      });

      expect(result.current.options).toHaveLength(1);
      expect(result.current.options[0]).toEqual({
        optionType: '',
        optionName: '',
        optionValue: '',
        additionalPrice: 0,
        stock: 0,
        sku: '',
        isActive: true,
        sortOrder: 0,
      });
    });

    it('기존 옵션이 있을 때 새 옵션의 sortOrder가 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.addOption();
      });

      expect(result.current.options).toHaveLength(3);
      expect(result.current.options[2]?.sortOrder).toBe(2);
    });

    it('여러 옵션을 연속으로 추가할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductOptions());

      act(() => {
        result.current.addOption();
      });
      
      act(() => {
        result.current.addOption();
      });
      
      act(() => {
        result.current.addOption();
      });

      expect(result.current.options).toHaveLength(3);
      expect(result.current.options[0]?.sortOrder).toBe(0);
      expect(result.current.options[1]?.sortOrder).toBe(1);
      expect(result.current.options[2]?.sortOrder).toBe(2);
    });
  });

  describe('옵션 수정', () => {
    it('특정 인덱스의 옵션 필드가 올바르게 수정되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.handleOptionChange(0, 'optionValue', 'blue');
      });

      expect(result.current.options[0]?.optionValue).toBe('blue');
      expect(result.current.options[1]).toEqual(mockInitialOptions[1]); // 다른 옵션은 변경되지 않음
    });

    it('숫자 필드가 올바르게 수정되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.handleOptionChange(0, 'additionalPrice', 5000);
      });

      expect(result.current.options[0]?.additionalPrice).toBe(5000);
    });

    it('불린 필드가 올바르게 수정되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.handleOptionChange(0, 'isActive', false);
      });

      expect(result.current.options[0]?.isActive).toBe(false);
    });

    it('여러 필드를 연속으로 수정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.handleOptionChange(0, 'optionValue', 'green');
        result.current.handleOptionChange(0, 'additionalPrice', 3000);
        result.current.handleOptionChange(0, 'stock', 20);
      });

      expect(result.current.options[0]?.optionValue).toBe('green');
      expect(result.current.options[0]?.additionalPrice).toBe(3000);
      expect(result.current.options[0]?.stock).toBe(20);
    });

    it('존재하지 않는 인덱스 수정시 에러가 발생하지 않아야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      expect(() => {
        act(() => {
          result.current.handleOptionChange(10, 'optionValue', 'test');
        });
      }).not.toThrow();

      // 기존 옵션들은 변경되지 않아야 함
      expect(result.current.options).toEqual(mockInitialOptions);
    });
  });

  describe('옵션 제거', () => {
    it('특정 인덱스의 옵션이 제거되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.removeOption(0);
      });

      expect(result.current.options).toHaveLength(1);
      expect(result.current.options[0]).toEqual(mockInitialOptions[1]);
    });

    it('마지막 옵션을 제거할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.removeOption(1);
      });

      expect(result.current.options).toHaveLength(1);
      expect(result.current.options[0]).toEqual(mockInitialOptions[0]);
    });

    it('모든 옵션을 제거할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.removeOption(0);
        result.current.removeOption(0); // 인덱스는 제거 후 재조정됨
      });

      expect(result.current.options).toHaveLength(0);
    });

    it('존재하지 않는 인덱스 제거시 에러가 발생하지 않아야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      expect(() => {
        act(() => {
          result.current.removeOption(10);
        });
      }).not.toThrow();

      // 기존 옵션들은 변경되지 않아야 함
      expect(result.current.options).toEqual(mockInitialOptions);
    });
  });

  describe('옵션 이동', () => {
    it('옵션이 올바른 위치로 이동되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.moveOption(0, 1);
      });

      expect(result.current.options[0]).toEqual({ ...mockInitialOptions[1], sortOrder: 0 });
      expect(result.current.options[1]).toEqual({ ...mockInitialOptions[0], sortOrder: 1 });
    });

    it('옵션 이동 후 sortOrder가 올바르게 업데이트되어야 한다', () => {
      const threeOptions = [
        ...mockInitialOptions,
        {
          optionType: 'material',
          optionName: '소재',
          optionValue: 'cotton',
          additionalPrice: 0,
          stock: 15,
          sku: 'MAT-COT',
          isActive: true,
          sortOrder: 2,
        },
      ];

      const { result } = renderHook(() => useProductOptions(threeOptions));

      act(() => {
        result.current.moveOption(2, 0); // 마지막을 첫 번째로
      });

      expect(result.current.options[0]?.sortOrder).toBe(0);
      expect(result.current.options[1]?.sortOrder).toBe(1);
      expect(result.current.options[2]?.sortOrder).toBe(2);
    });

    it('같은 위치로 이동시 변경되지 않아야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));
      const originalOptions = [...result.current.options];

      act(() => {
        result.current.moveOption(0, 0);
      });

      expect(result.current.options[0]).toEqual({ ...originalOptions[0], sortOrder: 0 });
      expect(result.current.options[1]).toEqual({ ...originalOptions[1], sortOrder: 1 });
    });

    it('존재하지 않는 인덱스에서 이동시 변경되지 않아야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));
      const originalOptions = [...result.current.options];

      act(() => {
        result.current.moveOption(10, 0);
      });

      expect(result.current.options).toEqual(originalOptions);
    });

    it('존재하지 않는 인덱스로 이동시에도 처리되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.moveOption(0, 10);
      });

      // 마지막 위치로 이동됨
      expect(result.current.options).toHaveLength(2);
      expect(result.current.options[1]).toEqual({ ...mockInitialOptions[0], sortOrder: 1 });
    });
  });

  describe('옵션 초기화', () => {
    it('모든 옵션이 제거되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.resetOptions();
      });

      expect(result.current.options).toEqual([]);
    });

    it('초기화 후 새 옵션을 추가할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));

      act(() => {
        result.current.resetOptions();
      });
      
      act(() => {
        result.current.addOption();
      });

      expect(result.current.options).toHaveLength(1);
      expect(result.current.options[0]?.sortOrder).toBe(0);
    });
  });

  describe('메모리 및 성능', () => {
    it('핸들러 함수들이 리렌더링에서 안정적이어야 한다', () => {
      const { result, rerender } = renderHook(() => useProductOptions());

      const firstRenderHandlers = {
        handleOptionChange: result.current.handleOptionChange,
        removeOption: result.current.removeOption,
        moveOption: result.current.moveOption,
        resetOptions: result.current.resetOptions,
      };

      rerender();

      expect(result.current.handleOptionChange).toBe(firstRenderHandlers.handleOptionChange);
      expect(result.current.removeOption).toBe(firstRenderHandlers.removeOption);
      expect(result.current.moveOption).toBe(firstRenderHandlers.moveOption);
      expect(result.current.resetOptions).toBe(firstRenderHandlers.resetOptions);
    });

    it('addOption은 options.length에 의존하므로 옵션 변경시 재생성되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions());
      const firstAddOption = result.current.addOption;

      act(() => {
        result.current.addOption();
      });

      // options.length가 변경되었으므로 addOption이 재생성됨
      expect(result.current.addOption).not.toBe(firstAddOption);
    });
  });

  describe('상태 불변성', () => {
    it('옵션 변경시 원본 배열이 변경되지 않아야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));
      const originalOptions = result.current.options;

      act(() => {
        result.current.handleOptionChange(0, 'optionValue', 'changed');
      });

      expect(result.current.options).not.toBe(originalOptions);
      expect(result.current.options[0]).not.toBe(originalOptions[0]);
    });

    it('옵션 추가시 기존 옵션들의 참조가 유지되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));
      const originalFirstOption = result.current.options[0];

      act(() => {
        result.current.addOption();
      });

      expect(result.current.options[0]).toBe(originalFirstOption);
    });

    it('옵션 이동시 새로운 배열이 생성되어야 한다', () => {
      const { result } = renderHook(() => useProductOptions(mockInitialOptions));
      const originalOptions = result.current.options;

      act(() => {
        result.current.moveOption(0, 1);
      });

      expect(result.current.options).not.toBe(originalOptions);
    });
  });
});