import React, { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';

// 랜덤 파일명 생성 유틸리티
function generateRandomFileName(originalExtension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `product_image_${timestamp}_${random}${originalExtension}`;
}

// 파일 확장자 추출 유틸리티
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '.jpg';
}

interface CompressionProgress {
  [key: string]: number;
}

interface UseProductImagesReturn {
  images: File[];
  imagePreviews: string[];
  isCompressing: boolean;
  compressionProgress: CompressionProgress;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  resetImages: () => void;
}

export function useProductImages(): UseProductImagesReturn {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress>({});

  const validateAndCompressImages = useCallback(
    async (files: File[]): Promise<{ compressedFiles: File[]; previews: string[] }> => {
      const compressionTasks = files.map(async (file) => {
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > 10) {
          toast.error(`${file.name}: 파일 크기가 10MB를 초과합니다 (${fileSizeMB.toFixed(1)}MB)`);
          return null;
        }

        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: 이미지 파일만 업로드 가능합니다.`);
          return null;
        }

        try {
          const progressKey = `${file.name}_${Date.now()}`;
          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            preserveExif: false,
            onProgress: (progress: number) => {
              setCompressionProgress((prev) => ({
                ...prev,
                [progressKey]: progress,
              }));
            },
          };

          const compressedFile = await imageCompression(file, options);

          setCompressionProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[progressKey];
            return newProgress;
          });

          // 랜덤한 파일명 생성
          const fileExtension = getFileExtension(file.name);
          const randomFileName = generateRandomFileName(fileExtension);
          
          // 새로운 파일명으로 File 객체 재생성
          const renamedFile = new File([compressedFile], randomFileName, {
            type: compressedFile.type,
            lastModified: compressedFile.lastModified,
          });

          const originalSizeMB = file.size / 1024 / 1024;
          const compressedSizeMB = renamedFile.size / 1024 / 1024;
          toast.success(
            `${file.name} 압축 완료: ${originalSizeMB.toFixed(1)}MB → ${compressedSizeMB.toFixed(1)}MB`,
          );

          return {
            file: renamedFile,
            preview: URL.createObjectURL(renamedFile),
          };
        } catch (error) {
          console.error('Image compression failed:', error);
          toast.error(`${file.name}: 이미지 압축에 실패했습니다.`);
          return null;
        }
      });

      const results = await Promise.all(compressionTasks);
      const validResults = results.filter((r): r is { file: File; preview: string } => r !== null);

      return {
        compressedFiles: validResults.map((r) => r.file),
        previews: validResults.map((r) => r.preview),
      };
    },
    [],
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(e.target.files || []);

      // 최대 5개까지만 허용
      if (images.length + files.length > 5) {
        toast.error('최대 5개의 이미지만 업로드할 수 있습니다.');
        e.target.value = '';
        return;
      }

      setIsCompressing(true);

      try {
        const { compressedFiles, previews } = await validateAndCompressImages(files);

        setImages((prev) => [...prev, ...compressedFiles]);
        setImagePreviews((prev) => [...prev, ...previews]);

        if (compressedFiles.length > 0) {
          const totalSizeMB = compressedFiles.reduce(
            (total, file) => total + file.size / 1024 / 1024,
            0,
          );
          const currentTotalMB = images.reduce((total, file) => total + file.size / 1024 / 1024, 0);
          
          // 랜덤 파일명으로 생성된 파일들 정보 표시
          const addedFileNames = compressedFiles.map(file => file.name).join(', ');
          toast.info(
            `총 ${compressedFiles.length}개 이미지 추가됨\n파일명: ${addedFileNames}\n총 용량: ${(currentTotalMB + totalSizeMB).toFixed(1)}MB`,
            { style: { whiteSpace: 'pre-line' } }
          );
        }
      } finally {
        setIsCompressing(false);
        e.target.value = '';
      }
    },
    [images, validateAndCompressImages],
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);

      // 기존 preview URL 해제
      const previewUrl = imagePreviews[index];
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setImages(newImages);
      setImagePreviews(newPreviews);
    },
    [images, imagePreviews],
  );

  const resetImages = useCallback(() => {
    // 모든 preview URL 해제
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviews([]);
  }, [imagePreviews]);

  return {
    images,
    imagePreviews,
    isCompressing,
    compressionProgress,
    handleImageUpload,
    removeImage,
    resetImages,
  };
}
