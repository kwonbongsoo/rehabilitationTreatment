import { useState, FormEvent } from 'react';
import FormInput from './FormInput';
import AuthButton from './AuthButton';
import styles from '@/styles/auth/LoginForm.module.css';

interface LoginFormProps {
    onSubmit: (id: string, password: string) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            await onSubmit(id, password);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <FormInput
                id="login-id"
                label="아이디"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
            />

            <FormInput
                id="login-password"
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
            />

            <div className={styles.rememberMe}>
                <input
                    type="checkbox"
                    id="remember"
                    className={styles.checkbox}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                    로그인 상태 유지
                </label>
            </div>

            <AuthButton
                type="submit"
                isLoading={isLoading}
                loadingText="로그인 중..."
            >
                로그인
            </AuthButton>
        </form>
    );
}