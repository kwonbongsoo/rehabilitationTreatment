/**
 * 공통 폼 컴포넌트
 *
 * 프로젝트 전반에서 사용되는 폼 요소들을 표준화
 * - 일관된 스타일링
 * - 접근성 지원
 * - 검증 상태 표시
 * - 다양한 폼 요소 타입 지원
 */

import React, {
  InputHTMLAttributes,
  ReactElement,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import styles from './Form.module.css';

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
}: FormInputProps): ReactElement {
  const inputId = id;
  const inputName = name || id;
  const hasError = Boolean(error);

  const inputClasses = [styles.textInput, hasError && styles.error, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.formField}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      <input
        id={inputId}
        name={inputName}
        type={type}
        required={required}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={hasError}
        aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
        {...props}
      />

      {error && (
        <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${inputId}-help`} className={styles.helpText}>
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
}: FormSelectProps): ReactElement {
  const selectId = id;
  const selectName = name || id;
  const hasError = Boolean(error);

  const selectClasses = [styles.selectInput, hasError && styles.error, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.formField}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>

      <select
        id={selectId}
        name={selectName}
        required={required}
        disabled={disabled}
        className={selectClasses}
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
        <span id={`${selectId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${selectId}-help`} className={styles.helpText}>
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
}: FormTextareaProps): ReactElement {
  const textareaId = id;
  const textareaName = name || id;
  const hasError = Boolean(error);

  const textareaClasses = [styles.textareaInput, hasError && styles.error, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.formField}>
      <label htmlFor={textareaId} className={styles.label}>
        {label}
      </label>

      <textarea
        id={textareaId}
        name={textareaName}
        required={required}
        disabled={disabled}
        rows={rows}
        className={textareaClasses}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined
        }
        {...props}
      />

      {error && (
        <span id={`${textareaId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${textareaId}-help`} className={styles.helpText}>
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
}: FormCheckboxProps): ReactElement {
  const checkboxId = id;
  const checkboxName = name || id;
  const hasError = Boolean(error);

  const checkboxClasses = [styles.checkbox, hasError && styles.error, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.formField}>
      <div className={styles.checkboxContainer}>
        <input
          id={checkboxId}
          name={checkboxName}
          type="checkbox"
          required={required}
          disabled={disabled}
          className={checkboxClasses}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${checkboxId}-error` : helpText ? `${checkboxId}-help` : undefined
          }
          {...props}
        />
        <label htmlFor={checkboxId} className={styles.checkboxLabel}>
          {label}
        </label>
      </div>

      {error && (
        <span id={`${checkboxId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${checkboxId}-help`} className={styles.helpText}>
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
}: FormRadioGroupProps): ReactElement {
  const groupName = name || id;
  const hasError = Boolean(error);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange?.(event.target.value);
  };

  const radioClasses = [styles.radio, hasError && styles.error].filter(Boolean).join(' ');

  return (
    <fieldset className={`${styles.radioFieldset} ${className}`}>
      <legend className={styles.radioLegend}>{label}</legend>

      <div className={styles.radioGroup}>
        {options.map((option, index) => {
          const radioId = `${id}-${index}`;
          return (
            <div key={option.value} className={styles.radioContainer}>
              <input
                id={radioId}
                name={groupName}
                type="radio"
                value={option.value}
                checked={value === option.value}
                required={required}
                disabled={disabled || option.disabled}
                onChange={handleChange}
                className={radioClasses}
                aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
              />
              <label htmlFor={radioId} className={styles.radioLabel}>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>

      {error && (
        <span id={`${id}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}

      {helpText && !error && (
        <span id={`${id}-help`} className={styles.helpText}>
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
}: FormFieldGroupProps): ReactElement {
  return (
    <div className={`${styles.fieldGroup} ${className}`}>
      {title && <h3 className={styles.fieldGroupTitle}>{title}</h3>}
      {description && <p className={styles.fieldGroupDescription}>{description}</p>}
      <div className={styles.fieldGroupContent}>{children}</div>
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

export function FormActions({
  children,
  align = 'right',
  className = '',
}: FormActionsProps): ReactElement {
  const alignmentClass = align === 'space-between' ? styles.spaceBetween : styles[align];

  return (
    <div
      className={`${styles.formActions} ${alignmentClass} ${className}`}
      data-testid="form-actions"
    >
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
}: FormContainerProps): ReactElement {
  return (
    <form
      onSubmit={onSubmit}
      className={`${styles.formContainer} ${className}`}
      noValidate={noValidate}
      data-testid="form-container"
    >
      {children}
    </form>
  );
}
