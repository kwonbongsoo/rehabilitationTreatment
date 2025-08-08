import { useState, useCallback } from 'react';

interface UseProductSpecificationsReturn {
  specifications: Record<string, string>;
  handleSpecificationChange: (key: string, value: string) => void;
  addSpecification: () => void;
  removeSpecification: (key: string) => void;
  resetSpecifications: () => void;
}

export function useProductSpecifications(
  initialSpecs: Record<string, string> = {}
): UseProductSpecificationsReturn {
  const [specifications, setSpecifications] = useState<Record<string, string>>(initialSpecs);

  const handleSpecificationChange = useCallback((key: string, value: string) => {
    setSpecifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const addSpecification = useCallback(() => {
    const key = `spec_${Date.now()}`;
    handleSpecificationChange(key, '');
  }, [handleSpecificationChange]);

  const removeSpecification = useCallback((key: string) => {
    setSpecifications((prev) => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  }, []);

  const resetSpecifications = useCallback(() => {
    setSpecifications({});
  }, []);

  return {
    specifications,
    handleSpecificationChange,
    addSpecification,
    removeSpecification,
    resetSpecifications,
  };
}