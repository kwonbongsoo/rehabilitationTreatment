/**
 * 공통 폼 컴포넌트
 *
 * 프로젝트 전반에서 사용되는 폼 요소들을 표준화
 * - 일관된 스타일링
 * - 접근성 지원
 * - 검증 상태 표시
 * - 다양한 폼 요소 타입 지원
 */

// import styles from '@/styles/auth/FormInput.module.css';
import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

/**
 * 기본 폼 필드 속성
 */
interface BaseFormFieldProps {
  label: string;
  id: string;
  name?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * 폼 입력 필드 컴포넌트
 */
interface FormInputProps
  extends BaseFormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name'> {}

export function FormInput({
  label,
  id,
  name,
  error,
  helpText,
  required = false,
  disabled = false,
  type = 'text',
  className = '',
  ...props
}: FormInputProps) {
  const inputId = id;
  const inputName = name || id;
  const hasError = Boolean(error);

  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={inputId} style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>
        {label}
        {required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
      </label>

      <input
        id={inputId}
        name={inputName}
        type={type}
        required={required}
        disabled={disabled}
        className={className}
        style={{
          width: '100%',
          padding: '12px',
          border: hasError ? '1px solid #e74c3c' : '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...props}
      />

      {error && (
        <span id={`${inputId}-error`} style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${inputId}-help`} style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

/**
 * 폼 선택 필드 컴포넌트
 */
interface FormSelectProps
  extends BaseFormFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name'> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export function FormSelect({
  label,
  id,
  name,
  error,
  helpText,
  required = false,
  disabled = false,
  options,
  placeholder,
  className = '',
  ...props
}: FormSelectProps) {
  const selectId = id;
  const selectName = name || id;
  const hasError = Boolean(error);

  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={selectId} style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>
        {label}
        {required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
      </label>

      <select
        id={selectId}
        name={selectName}
        required={required}
        disabled={disabled}
        className={className}
        style={{
          width: '100%',
          padding: '12px',
          border: hasError ? '1px solid #e74c3c' : '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          background: 'white'
        }}
        aria-invalid={hasError}
        aria-describedby={error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span id={`${selectId}-error`} style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${selectId}-help`} style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

/**
 * 폼 텍스트영역 컴포넌트
 */
interface FormTextareaProps
  extends BaseFormFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'name'> {}

export function FormTextarea({
  label,
  id,
  name,
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  ...props
}: FormTextareaProps) {
  const textareaId = id;
  const textareaName = name || id;
  const hasError = Boolean(error);

  return (
    <div style={{ marginBottom: '16px' }}>
      <label htmlFor={textareaId} style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px', display: 'block' }}>
        {label}
        {required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
      </label>

      <textarea
        id={textareaId}
        name={textareaName}
        required={required}
        disabled={disabled}
        rows={rows}
        className={className}
        style={{
          width: '100%',
          padding: '12px',
          border: hasError ? '1px solid #e74c3c' : '1px solid #ddd',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          resize: 'vertical'
        }}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined
        }
        {...props}
      />

      {error && (
        <span id={`${textareaId}-error`} style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${textareaId}-help`} style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

/**
 * 폼 체크박스 컴포넌트
 */
interface FormCheckboxProps
  extends BaseFormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'type'> {}

export function FormCheckbox({
  label,
  id,
  name,
  error,
  helpText,
  required = false,
  disabled = false,
  className = '',
  ...props
}: FormCheckboxProps) {
  const checkboxId = id;
  const checkboxName = name || id;
  const hasError = Boolean(error);

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          id={checkboxId}
          name={checkboxName}
          type="checkbox"
          required={required}
          disabled={disabled}
          className={className}
          style={{
            width: '16px',
            height: '16px',
            border: hasError ? '1px solid #e74c3c' : '1px solid #ddd',
            borderRadius: '4px'
          }}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${checkboxId}-error` : helpText ? `${checkboxId}-help` : undefined
          }
          {...props}
        />
        <label htmlFor={checkboxId} style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
          {label}
          {required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
        </label>
      </div>

      {error && (
        <span id={`${checkboxId}-error`} style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${checkboxId}-help`} style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
          {helpText}
        </span>
      )}
    </div>
  );
}

/**
 * 폼 라디오 그룹 컴포넌트
 */
interface FormRadioGroupProps extends BaseFormFieldProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function FormRadioGroup({
  label,
  id,
  name,
  error,
  helpText,
  required = false,
  disabled = false,
  options,
  value,
  onChange,
  className = '',
}: FormRadioGroupProps) {
  const groupName = name || id;
  const hasError = Boolean(error);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <fieldset style={{ border: 'none', margin: '0', padding: '0' }} className={className}>
      <legend style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '8px' }}>
        {label}
        {required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
      </legend>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((option, index) => {
          const radioId = `${id}-${index}`;
          return (
            <div key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id={radioId}
                name={groupName}
                type="radio"
                value={option.value}
                checked={value === option.value}
                required={required}
                disabled={disabled || option.disabled}
                onChange={handleChange}
                style={{
                  width: '16px',
                  height: '16px',
                  border: hasError ? '1px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '50%'
                }}
                aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
              />
              <label htmlFor={radioId} style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>

      {error && (
        <span id={`${id}-error`} style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${id}-help`} style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
          {helpText}
        </span>
      )}
    </fieldset>
  );
}

/**
 * 폼 필드 그룹 컴포넌트
 */
interface FormFieldGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldGroup({
  title,
  description,
  children,
  className = '',
}: FormFieldGroupProps) {
  return (
    <div style={{ marginBottom: '24px' }} className={className}>
      {title && <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>{title}</h3>}
      {description && <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>{description}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
    </div>
  );
}

/**
 * 폼 액션 버튼 그룹 컴포넌트
 */
interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
  className?: string;
}

export function FormActions({ children, align = 'right', className = '' }: FormActionsProps) {
  return (
    <div style={{ display: 'flex', justifyContent: align === 'left' ? 'flex-start' : align === 'center' ? 'center' : align === 'space-between' ? 'space-between' : 'flex-end', gap: '12px', marginTop: '24px' }} className={className}>
      {children}
    </div>
  );
}

/**
 * 폼 컨테이너 컴포넌트
 */
interface FormContainerProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  className?: string;
  noValidate?: boolean;
}

export function FormContainer({
  onSubmit,
  children,
  className = '',
  noValidate = true,
}: FormContainerProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className={className} noValidate={noValidate}>
      {children}
    </form>
  );
}
