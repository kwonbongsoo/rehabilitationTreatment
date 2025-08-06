import React, { useState, useCallback } from 'react';

interface UseProductImagesReturn {
  images: File[];
  imagePreviews: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  resetImages: () => void;
}

export function useProductImages(): UseProductImagesReturn {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files];

    // 최대 5개까지만 허용
    if (newImages.length > 5) {
      alert('최대 5개의 이미지만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    // 이미지 미리보기 생성
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setImages(newImages);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = '';
  }, [images]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // 기존 preview URL 해제
    const previewUrl = imagePreviews[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setImages(newImages);
    setImagePreviews(newPreviews);
  }, [images, imagePreviews]);

  const resetImages = useCallback(() => {
    // 모든 preview URL 해제
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviews([]);
  }, [imagePreviews]);

  return {
    images,
    imagePreviews,
    handleImageUpload,
    removeImage,
    resetImages,
  };
}