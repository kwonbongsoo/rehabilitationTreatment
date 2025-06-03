import { useState, FormEvent } from 'react';
import FormInput from './FormInput';
import AuthButton from './AuthButton';
import { LoginRequest } from '@/api/models/auth';
import styles from '@/styles/auth/LoginForm.module.css';

interface LoginFormProps {
    onSubmit: (credentials: LoginRequest) => Promise<void>;
    isLoading?: boolean;
    error?: string;
}

export default function LoginForm({ onSubmit, isLoading: externalLoading = false }: LoginFormProps) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [internalLoading, setInternalLoading] = useState(false);

    const isLoading = externalLoading || internalLoading;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!id.trim() || !password.trim()) {
            return;
        }

        setInternalLoading(true);
        try {
            await onSubmit({
                id: id.trim(),
                password,
            });
        } finally {
            setInternalLoading(false);
        }
    }; return (
        <form onSubmit={handleSubmit} className={styles.form}>            <FormInput
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

            <AuthButton
                type="submit"
                isLoading={isLoading}
                loadingText="로그인 중..."
                disabled={!id.trim() || !password.trim() || isLoading}
            >
                로그인
            </AuthButton>
        </form>
    );
}