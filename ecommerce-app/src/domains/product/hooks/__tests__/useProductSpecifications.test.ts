/**
 * useProductSpecifications 훅 테스트
 * 
 * 상품 사양 관리 로직을 테스트합니다.
 * 사이드이펙트 방지를 위해 Date.now를 모킹합니다.
 */

import { renderHook, act } from '@testing-library/react';
import { useProductSpecifications } from '../useProductSpecifications';

// Date.now 모킹 - 일관된 키 생성을 위해
const mockDateNow = jest.fn();
const originalDateNow = Date.now;

describe('useProductSpecifications', () => {
  const mockInitialSpecs = {
    material: 'cotton',
    color: 'blue',
    weight: '500g',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Date.now를 모킹하여 일관된 키 생성
    Date.now = mockDateNow;
    mockDateNow.mockReturnValue(1234567890123);
  });

  afterEach(() => {
    // Date.now 복원
    Date.now = originalDateNow;
  });

  describe('초기 상태', () => {
    it('초기 사양 없이 생성할 때 빈 객체가 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      expect(result.current.specifications).toEqual({});
    });

    it('초기 사양이 제공될 때 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      expect(result.current.specifications).toEqual(mockInitialSpecs);
    });

    it('모든 핸들러 함수들이 제공되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      expect(typeof result.current.handleSpecificationChange).toBe('function');
      expect(typeof result.current.addSpecification).toBe('function');
      expect(typeof result.current.removeSpecification).toBe('function');
      expect(typeof result.current.resetSpecifications).toBe('function');
    });
  });

  describe('사양 변경', () => {
    it('기존 키의 값을 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.handleSpecificationChange('material', 'polyester');
      });

      expect(result.current.specifications.material).toBe('polyester');
      expect(result.current.specifications.color).toBe('blue'); // 다른 값은 유지
      expect(result.current.specifications.weight).toBe('500g'); // 다른 값은 유지
    });

    it('새로운 키와 값을 추가할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.handleSpecificationChange('size', 'L');
      });

      expect(result.current.specifications.size).toBe('L');
      expect(Object.keys(result.current.specifications)).toHaveLength(4);
    });

    it('빈 값으로 설정할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.handleSpecificationChange('material', '');
      });

      expect(result.current.specifications.material).toBe('');
    });

    it('여러 사양을 연속으로 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      act(() => {
        result.current.handleSpecificationChange('brand', 'TestBrand');
        result.current.handleSpecificationChange('model', 'TestModel');
        result.current.handleSpecificationChange('year', '2024');
      });

      expect(result.current.specifications).toEqual({
        brand: 'TestBrand',
        model: 'TestModel',
        year: '2024',
      });
    });
  });

  describe('사양 추가', () => {
    it('새로운 사양이 고유한 키로 추가되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      act(() => {
        result.current.addSpecification();
      });

      expect(result.current.specifications).toHaveProperty('spec_1234567890123');
      expect(result.current.specifications['spec_1234567890123']).toBe('');
    });

    it('여러 사양을 추가할 때 서로 다른 키가 생성되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      // 다른 시간을 반환하도록 모킹
      mockDateNow
        .mockReturnValueOnce(1111111111111)
        .mockReturnValueOnce(2222222222222)
        .mockReturnValueOnce(3333333333333);

      act(() => {
        result.current.addSpecification();
        result.current.addSpecification();
        result.current.addSpecification();
      });

      expect(result.current.specifications).toEqual({
        'spec_1111111111111': '',
        'spec_2222222222222': '',
        'spec_3333333333333': '',
      });
    });

    it('기존 사양이 있는 상태에서 새 사양을 추가할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.addSpecification();
      });

      expect(Object.keys(result.current.specifications)).toHaveLength(4);
      expect(result.current.specifications).toHaveProperty('spec_1234567890123');
      expect(result.current.specifications.material).toBe('cotton'); // 기존 값 유지
    });
  });

  describe('사양 제거', () => {
    it('특정 키의 사양을 제거할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.removeSpecification('material');
      });

      expect(result.current.specifications).not.toHaveProperty('material');
      expect(result.current.specifications.color).toBe('blue'); // 다른 값은 유지
      expect(Object.keys(result.current.specifications)).toHaveLength(2);
    });

    it('여러 사양을 연속으로 제거할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.removeSpecification('material');
        result.current.removeSpecification('color');
      });

      expect(result.current.specifications).toEqual({
        weight: '500g',
      });
    });

    it('존재하지 않는 키를 제거해도 에러가 발생하지 않아야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      expect(() => {
        act(() => {
          result.current.removeSpecification('nonexistent');
        });
      }).not.toThrow();

      expect(result.current.specifications).toEqual(mockInitialSpecs);
    });

    it('모든 사양을 제거할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.removeSpecification('material');
        result.current.removeSpecification('color');
        result.current.removeSpecification('weight');
      });

      expect(result.current.specifications).toEqual({});
    });
  });

  describe('사양 초기화', () => {
    it('모든 사양이 제거되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.resetSpecifications();
      });

      expect(result.current.specifications).toEqual({});
    });

    it('빈 상태에서 초기화해도 에러가 발생하지 않아야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      expect(() => {
        act(() => {
          result.current.resetSpecifications();
        });
      }).not.toThrow();

      expect(result.current.specifications).toEqual({});
    });

    it('초기화 후 새 사양을 추가할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));

      act(() => {
        result.current.resetSpecifications();
        result.current.handleSpecificationChange('newSpec', 'newValue');
      });

      expect(result.current.specifications).toEqual({
        newSpec: 'newValue',
      });
    });
  });

  describe('복잡한 워크플로우', () => {
    it('추가-수정-제거 워크플로우가 올바르게 작동해야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      // 사양 추가
      act(() => {
        result.current.addSpecification();
      });

      const addedKey = Object.keys(result.current.specifications)[0]!;
      
      // 추가된 사양 수정
      act(() => {
        result.current.handleSpecificationChange(addedKey!, 'modified value');
      });

      expect(result.current.specifications[addedKey!]).toBe('modified value');

      // 다른 사양 추가
      mockDateNow.mockReturnValue(9999999999999);
      act(() => {
        result.current.addSpecification();
      });

      expect(Object.keys(result.current.specifications)).toHaveLength(2);

      // 첫 번째 사양 제거
      act(() => {
        result.current.removeSpecification(addedKey!);
      });

      expect(result.current.specifications).not.toHaveProperty(addedKey!);
      expect(Object.keys(result.current.specifications)).toHaveLength(1);
    });

    it('동일한 키로 여러 번 값을 변경할 수 있어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      act(() => {
        result.current.handleSpecificationChange('testKey', 'value1');
        result.current.handleSpecificationChange('testKey', 'value2');
        result.current.handleSpecificationChange('testKey', 'value3');
      });

      expect(result.current.specifications.testKey).toBe('value3');
    });
  });

  describe('메모리 및 성능', () => {
    it('핸들러 함수들이 리렌더링에서 안정적이어야 한다', () => {
      const { result, rerender } = renderHook(() => useProductSpecifications());

      const firstRenderHandlers = {
        handleSpecificationChange: result.current.handleSpecificationChange,
        removeSpecification: result.current.removeSpecification,
        resetSpecifications: result.current.resetSpecifications,
      };

      rerender();

      expect(result.current.handleSpecificationChange).toBe(firstRenderHandlers.handleSpecificationChange);
      expect(result.current.removeSpecification).toBe(firstRenderHandlers.removeSpecification);
      expect(result.current.resetSpecifications).toBe(firstRenderHandlers.resetSpecifications);
    });

    it('addSpecification은 handleSpecificationChange에 의존하므로 안정적이어야 한다', () => {
      const { result, rerender } = renderHook(() => useProductSpecifications());
      const firstAddSpecification = result.current.addSpecification;

      rerender();

      // handleSpecificationChange가 안정적이므로 addSpecification도 안정적이어야 함
      expect(result.current.addSpecification).toBe(firstAddSpecification);
    });

    it('상태 불변성이 유지되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));
      const originalSpecs = result.current.specifications;

      act(() => {
        result.current.handleSpecificationChange('newKey', 'newValue');
      });

      // 새로운 객체가 생성되어야 함
      expect(result.current.specifications).not.toBe(originalSpecs);
      expect(result.current.specifications.material).toBe('cotton'); // 기존 값은 유지
      expect(result.current.specifications.newKey).toBe('newValue'); // 새 값 추가
    });

    it('제거시에도 상태 불변성이 유지되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications(mockInitialSpecs));
      const originalSpecs = result.current.specifications;

      act(() => {
        result.current.removeSpecification('material');
      });

      expect(result.current.specifications).not.toBe(originalSpecs);
    });
  });

  describe('키 생성', () => {
    it('Date.now를 사용하여 고유한 키가 생성되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      // 특정 타임스탬프 모킹
      mockDateNow.mockReturnValue(1640995200000);

      act(() => {
        result.current.addSpecification();
      });

      expect(result.current.specifications).toHaveProperty('spec_1640995200000');
    });

    it('연속된 추가시 다른 키가 생성되어야 한다', () => {
      const { result } = renderHook(() => useProductSpecifications());

      // 연속된 다른 타임스탬프 모킹
      mockDateNow
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(2000);

      act(() => {
        result.current.addSpecification();
        result.current.addSpecification();
      });

      expect(result.current.specifications).toHaveProperty('spec_1000');
      expect(result.current.specifications).toHaveProperty('spec_2000');
      expect(Object.keys(result.current.specifications)).toHaveLength(2);
    });
  });
});