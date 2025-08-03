'use client';

import React from 'react';
import styles from '@/styles/account/AddProduct.module.css';
import { useProductForm } from '@/domains/product/hooks/useProductForm';
import { ProductImageUpload } from '@/domains/product/components/ProductImageUpload';
import { ProductBasicInfo } from '@/domains/product/components/ProductBasicInfo';
import { ProductCategoryStock } from '@/domains/product/components/ProductCategoryStock';
import { ProductDiscountOptions } from '@/domains/product/components/ProductDiscountOptions';
import { ProductDetails } from '@/domains/product/components/ProductDetails';
import { ProductSpecifications } from '@/domains/product/components/ProductSpecifications';
import { ProductOptions } from '@/domains/product/components/ProductOptions';

export default function AddProductPage() {
  const {
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
      handleOptionChange,
      addOption,
      removeOption,
      moveOption,
    },
  } = useProductForm();

  const handleSpecificationKeyChange = (oldKey: string, newKey: string, value: string) => {
    if (newKey !== oldKey) {
      const newSpecs = { ...formData.specifications };
      delete newSpecs[oldKey];
      newSpecs[newKey] = value;
      // Update formData through the hook
      handleSpecificationChange(newKey, value);
    }
  };

  return (
    <div className={styles.addProductContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <ProductImageUpload
          images={formData.images}
          imagePreviews={imagePreviews}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
        />

        <ProductBasicInfo
          formData={{
            name: formData.name,
            description: formData.description,
            price: formData.price,
            originalPrice: formData.originalPrice,
          }}
          errors={errors}
          onChange={handleInputChange}
        />

        <ProductCategoryStock
          formData={{
            categoryId: formData.categoryId,
            stock: formData.stock,
            ...(formData.sku && { sku: formData.sku }),
          }}
          errors={errors}
          categories={categories}
          loadingCategories={loadingCategories}
          onChange={handleInputChange}
        />

        <ProductDiscountOptions
          formData={{
            discountPercentage: formData.discountPercentage,
            isNew: formData.isNew,
            isFeatured: formData.isFeatured,
          }}
          onChange={handleInputChange}
        />

        <ProductDetails
          formData={{
            ...(formData.weight && { weight: formData.weight }),
            ...(formData.dimensions && { dimensions: formData.dimensions }),
          }}
          onChange={handleInputChange}
          onDimensionChange={handleDimensionChange}
        />

        <ProductSpecifications
          specifications={formData.specifications || {}}
          onSpecificationChange={handleSpecificationChange}
          onAddSpecification={addSpecification}
          onRemoveSpecification={removeSpecification}
          onSpecificationKeyChange={handleSpecificationKeyChange}
        />

        <ProductOptions
          options={formData.options || []}
          onOptionChange={handleOptionChange}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onMoveOption={moveOption}
        />

        <div className={styles.submitSection}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
