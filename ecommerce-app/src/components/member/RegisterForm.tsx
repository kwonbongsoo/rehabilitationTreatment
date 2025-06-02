import { useState, FormEvent } from 'react';
import FormInput from '../auth/FormInput';
import AuthButton from '../auth/AuthButton';
import styles from '@/styles/member/RegisterForm.module.css';

interface RegisterFormData {
    id: string;
    password: string;
    confirmPassword: string;
    name: string;
    email: string;
}

interface RegisterFormProps {
    onSubmit: (data: RegisterFormData) => Promise<boolean>;
    isLoading?: boolean;     // 외부에서 전달받는 로딩 상태
    isSubmitting?: boolean;  // 멱등성 관련 제출 상태
}

export default function RegisterForm({ onSubmit, isLoading: externalLoading, isSubmitting }: RegisterFormProps) {
    const [formData, setFormData] = useState<RegisterFormData>({
        id: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
    });
    const [internalLoading, setInternalLoading] = useState(false);

    // 외부 로딩 상태가 있으면 우선 사용, 없으면 내부 상태 사용
    const isFormLoading = externalLoading ?? internalLoading;

    // 버튼 비활성화 조건: 로딩 중이거나 제출 중인 경우
    const isButtonDisabled = isFormLoading || isSubmitting;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setInternalLoading(true);
        try {
            const success = await onSubmit(formData);
            if (success) {
                // 성공 시 폼 초기화
                setFormData({
                    id: '',
                    password: '',
                    confirmPassword: '',
                    name: '',
                    email: '',
                });
            }
        } finally {
            setInternalLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <FormInput
                id="register-id"
                name="id"
                label="아이디"
                type="text"
                value={formData.id}
                onChange={handleChange}
                placeholder="4자 이상 입력하세요"
                minLength={4}
                required
            />

            <FormInput
                id="register-name"
                name="name"
                label="이름"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="이름을 입력하세요"
                required
            />

            <FormInput
                id="register-email"
                name="email"
                label="이메일"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
            />

            <FormInput
                id="register-password"
                name="password"
                label="비밀번호"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8자 이상 입력하세요"
                minLength={8}
                required
            />

            <FormInput
                id="register-confirm-password"
                name="confirmPassword"
                label="비밀번호 확인"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
            />

            <div className={styles.terms}>
                <input
                    type="checkbox"
                    id="agree-terms"
                    className={styles.checkbox}
                    required
                />
                <label htmlFor="agree-terms" className={styles.checkboxLabel}>
                    이용약관 및 개인정보 처리방침에 동의합니다.
                </label>
            </div>

            <AuthButton
                type="submit"
                isLoading={isFormLoading}
                disabled={isButtonDisabled}
                loadingText="처리 중..."
            >
                회원가입
            </AuthButton>
        </form>
    );
}
