import { useState, FormEvent } from 'react';
import FormInput from './FormInput';
import AuthButton from './AuthButton';
import { ForgotPasswordRequest } from '@/api/models/auth';
import styles from '@/styles/auth/Form.module.css';

interface ForgotPasswordFormProps {
    onSubmit: (request: ForgotPasswordRequest) => Promise<void>;
    isLoading?: boolean;
    isSuccess?: boolean;
}

export default function ForgotPasswordForm({
    onSubmit,
    isLoading: externalLoading = false,
    isSuccess = false
}: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [internalLoading, setInternalLoading] = useState(false);

    const isLoading = externalLoading || internalLoading;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            return;
        }

        setInternalLoading(true);
        try {
            await onSubmit({
                email: email.trim()
            });
        } finally {
            setInternalLoading(false);
        }
    };

    // 성공 상태일 때는 성공 메시지 표시
    if (isSuccess) {
        return (
            <div className={styles.form}>
                <div className={styles.successMessage}>
                    <h3>이메일이 전송되었습니다!</h3>
                    <p>
                        입력하신 이메일 주소로 비밀번호 재설정 링크를 전송했습니다.<br />
                        이메일을 확인하시고 링크를 클릭하여 비밀번호를 재설정해주세요.
                    </p>
                    <p className={styles.emailNote}>
                        <strong>{email}</strong>로 전송되었습니다.
                    </p>
                    <p className={styles.helperText}>
                        이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.<br />
                        몇 분 후에도 이메일이 오지 않으면 다시 시도해주세요.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.description}>
                <p>
                    비밀번호를 재설정하려면 가입 시 사용한 이메일 주소를 입력해주세요.<br />
                    재설정 링크를 이메일로 보내드립니다.
                </p>
            </div>

            <FormInput
                id="forgot-password-email"
                label="이메일 주소"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                autoComplete="email"
                autoFocus
            />

            <AuthButton
                type="submit"
                isLoading={isLoading}
                loadingText="전송 중..."
                disabled={!email.trim() || isLoading}
                cooldownMs={3000} // 3초 쿨다운으로 스팸 방지
            >
                비밀번호 재설정 링크 보내기
            </AuthButton>

            <div className={styles.helperText}>
                <p>
                    • 이메일 전송까지 몇 분이 소요될 수 있습니다<br />
                    • 스팸 폴더도 함께 확인해주세요<br />
                    • 가입한 이메일 주소가 기억나지 않으시면 고객센터로 문의해주세요
                </p>
            </div>
        </form>
    );
}
