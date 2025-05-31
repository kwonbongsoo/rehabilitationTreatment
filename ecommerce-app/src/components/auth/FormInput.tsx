import { InputHTMLAttributes } from 'react';
import styles from '@/styles/auth/Form.module.css';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    name?: string;
    error?: string;
}

export default function FormInput({
    label,
    id,
    name,
    error,
    type = 'text',
    ...props
}: FormInputProps) {
    return (
        <div className={styles.inputGroup}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <input
                id={id}
                name={name || id}
                type={type}
                className={`${styles.input} ${error ? styles.inputWithError : ''}`}
                {...props}
            />
            {error && <span className={styles.inputError}>{error}</span>}
        </div>
    );
}