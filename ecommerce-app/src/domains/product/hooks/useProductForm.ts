import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/domains/auth/stores/useAuthStore';
import { createProduct } from '@/domains/product/services';
import { fetchCategories, type CategoryOption } from '@/domains/category/services/categoriesService';
import type { ProductFormData, ProductOption } from '@/domains/product/types/product';
import { validateField, validateForm } from '@/domains/product/utils/productValidation';
import { v4 as uuidv4 } from 'uuid';

interface ProductFormWithImages extends ProductFormData {
  images: File[];
}

export function useProductForm() {
  const { user } = useAuth();

  const [formData, setFormData] = useState<ProductFormWithImages>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    categoryId: 0,
    sellerId: '',
    stock: 0,
    isNew: false,
    isFeatured: false,
    discountPercentage: 0,
    images: [],
    options: [],
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const idempotencyKeyRef = useRef<string>(uuidv4());

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetchCategories();
        
        if (response.success && response.data) {
          setCategories(response.data);
        } else {
          console.error('Failed to fetch categories:', response.error);
          setErrors(prev => ({
            ...prev,
            categories: response.error || 'Failed to load categories'
          }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setErrors(prev => ({
          ...prev,
          categories: 'Failed to load categories'
        }));
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // 실시간 validation
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const addSpecification = () => {
    const key = `spec_${Date.now()}`;
    handleSpecificationChange(key, '');
  };

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.images, ...files];

    // 최대 5개까지만 허용
    if (newImages.length > 5) {
      alert('최대 5개의 이미지만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    // 이미지 미리보기 생성
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // 기존 preview URL 해제
    const previewUrl = imagePreviews[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviews(newPreviews);
  };

  // 옵션 관련 핸들러들
  const handleOptionChange = (index: number, field: keyof ProductOption, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      ) || [],
    }));
  };

  const addOption = () => {
    const newOption: ProductOption = {
      optionType: '',
      optionName: '',
      optionValue: '',
      additionalPrice: 0,
      stock: 0,
      sku: '',
      isActive: true,
      sortOrder: formData.options?.length || 0,
    };

    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const moveOption = (fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const options = [...(prev.options || [])];
      const movedOption = options[fromIndex];
      if (!movedOption) return prev;
      
      options.splice(fromIndex, 1);
      options.splice(toIndex, 0, movedOption);
      
      // sortOrder 업데이트
      const updatedOptions = options.map((option, index) => ({
        ...option,
        sortOrder: index,
      }));

      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 폼 데이터 검증
      const validationError = validateForm(formData);
      if (validationError) {
        alert(validationError);
        setIsSubmitting(false);
        return;
      }

      // 사용자 인증 확인
      if (!user?.id) {
        alert('로그인이 필요합니다.');
        setIsSubmitting(false);
        return;
      }

      // FormData 생성
      const formDataToSend = createFormDataForSubmission(formData, user.id, idempotencyKeyRef.current);

      // Server Action 호출
      const result = await createProduct(formDataToSend);

      if (!result.success) {
        handleSubmissionError(result);
        setIsSubmitting(false);
        return;
      }

      // 성공 시 새로운 idempotency key 생성
      idempotencyKeyRef.current = uuidv4();
    } catch (error) {
      console.error('상품 등록 실패:', error);
      handleUnexpectedError(error);
      setIsSubmitting(false);
    }
  };

  // 서버 에러 처리
  const handleSubmissionError = (result: any) => {
    if (result.errors) {
      setErrors(result.errors);
      // 첫 번째 에러 필드로 스크롤 (옵션널)
      const firstErrorField = Object.keys(result.errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        element?.focus();
      }
    } else {
      alert(result.message || '상품 등록에 실패했습니다.');
    }
  };

  // 예상치 못한 에러 처리
  const handleUnexpectedError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : '상품 등록 중 오류가 발생했습니다.';
    alert(`${errorMessage} 다시 시도해주세요.`);
  };

  return {
    formData,
    imagePreviews,
    isSubmitting,
    errors,
    categories,
    loadingCategories,
    handlers: {
      handleInputChange,
      handleDimensionChange,
      handleSpecificationChange,
      addSpecification,
      removeSpecification,
      handleImageUpload,
      removeImage,
      handleSubmit,
      // 옵션 관련 핸들러들
      handleOptionChange,
      addOption,
      removeOption,
      moveOption,
    },
  };
}

// FormData 생성 헬퍼 함수
function createFormDataForSubmission(
  formData: ProductFormWithImages, 
  sellerId: string, 
  idempotencyKey: string
): FormData {
  const formDataToSend = new FormData();

  // 기본 상품 정보
  formDataToSend.append('name', formData.name);
  formDataToSend.append('description', formData.description);
  formDataToSend.append('price', formData.price.toString());
  formDataToSend.append('originalPrice', formData.originalPrice.toString());
  formDataToSend.append('categoryId', formData.categoryId.toString());
  formDataToSend.append('sellerId', sellerId);
  formDataToSend.append('stock', (formData.stock || 0).toString());
  formDataToSend.append('isNew', formData.isNew.toString());
  formDataToSend.append('isFeatured', formData.isFeatured.toString());
  formDataToSend.append('discountPercentage', (formData.discountPercentage || 0).toString());

  // 선택적 정보
  if (formData.sku) formDataToSend.append('sku', formData.sku);
  if (formData.weight) formDataToSend.append('weight', formData.weight.toString());

  // 치수 정보
  if (formData.dimensions?.length) {
    formDataToSend.append('dimensions.length', formData.dimensions.length.toString());
  }
  if (formData.dimensions?.width) {
    formDataToSend.append('dimensions.width', formData.dimensions.width.toString());
  }
  if (formData.dimensions?.height) {
    formDataToSend.append('dimensions.height', formData.dimensions.height.toString());
  }

  // 사양 정보
  Object.entries(formData.specifications || {}).forEach(([key, value]) => {
    if (value?.trim()) {
      formDataToSend.append(key, value);
    }
  });

  // 옵션 데이터
  if (formData.options && formData.options.length > 0) {
    formDataToSend.append('options', JSON.stringify(formData.options));
  }

  // 이미지 파일들
  formData.images.forEach((image) => {
    formDataToSend.append('images', image);
  });

  // Idempotency Key
  formDataToSend.append('idempotencyKey', idempotencyKey);

  return formDataToSend;
}