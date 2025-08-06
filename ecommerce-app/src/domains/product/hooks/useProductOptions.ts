import { useState, useCallback } from 'react';
import type { ProductOption } from '@/domains/product/types/product';

interface UseProductOptionsReturn {
  options: ProductOption[];
  handleOptionChange: (
    index: number,
    field: keyof ProductOption,
    value: string | number | boolean,
  ) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  moveOption: (fromIndex: number, toIndex: number) => void;
  resetOptions: () => void;
}

export function useProductOptions(initialOptions: ProductOption[] = []): UseProductOptionsReturn {
  const [options, setOptions] = useState<ProductOption[]>(initialOptions);

  const handleOptionChange = useCallback(
    (index: number, field: keyof ProductOption, value: string | number | boolean): void => {
      setOptions((prev) =>
        prev.map((option, i) => (i === index ? { ...option, [field]: value } : option)),
      );
    },
    [],
  );

  const addOption = useCallback(() => {
    const newOption: ProductOption = {
      optionType: '',
      optionName: '',
      optionValue: '',
      additionalPrice: 0,
      stock: 0,
      sku: '',
      isActive: true,
      sortOrder: options.length,
    };

    setOptions((prev) => [...prev, newOption]);
  }, [options.length]);

  const removeOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveOption = useCallback((fromIndex: number, toIndex: number) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      const movedOption = newOptions[fromIndex];

      if (!movedOption) return prev;

      newOptions.splice(fromIndex, 1);
      newOptions.splice(toIndex, 0, movedOption);

      // sortOrder 업데이트
      return newOptions.map((option, index) => ({
        ...option,
        sortOrder: index,
      }));
    });
  }, []);

  const resetOptions = useCallback(() => {
    setOptions([]);
  }, []);

  return {
    options,
    handleOptionChange,
    addOption,
    removeOption,
    moveOption,
    resetOptions,
  };
}
