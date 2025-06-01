/**
 * 회원가입 도메인 서비스
 * 회원가입 관련 비즈니스 규칙과 검증 로직을 캡슐화
 */
export class RegisterDomainService {
    /**
     * 회원가입 폼 데이터 검증
     */
    validateRegisterForm(formData: {
        id: string;
        password: string;
        confirmPassword: string;
        name: string;
        email: string;
    }): void {
        const errors: string[] = [];

        // 아이디 검증
        if (!formData.id?.trim()) {
            errors.push('아이디를 입력해주세요.');
        } else {
            if (formData.id.trim().length < 4) {
                errors.push('아이디는 4자 이상이어야 합니다.');
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(formData.id.trim())) {
                errors.push('아이디는 영문, 숫자, _, - 만 사용할 수 있습니다.');
            }
        }

        // 이름 검증
        if (!formData.name?.trim()) {
            errors.push('이름을 입력해주세요.');
        } else if (formData.name.trim().length < 2) {
            errors.push('이름은 2자 이상이어야 합니다.');
        }

        // 이메일 검증
        if (!formData.email?.trim()) {
            errors.push('이메일을 입력해주세요.');
        } else if (!this.isValidEmail(formData.email.trim())) {
            errors.push('올바른 이메일 형식을 입력해주세요.');
        }

        // 비밀번호 검증
        if (!formData.password?.trim()) {
            errors.push('비밀번호를 입력해주세요.');
        } else if (formData.password.length < 8) {
            errors.push('비밀번호는 8자 이상이어야 합니다.');
        }

        // 비밀번호 확인 검증
        if (!formData.confirmPassword?.trim()) {
            errors.push('비밀번호 확인을 입력해주세요.');
        } else if (formData.password !== formData.confirmPassword) {
            errors.push('비밀번호가 일치하지 않습니다.');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(' '));
        }
    }

    /**
     * 이메일 형식 검증
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 비밀번호 강도 검증
     */
    getPasswordStrength(password: string): {
        score: number; // 0-4
        feedback: string[];
    } {
        const feedback: string[] = [];
        let score = 0;

        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score < 2) {
            feedback.push('비밀번호가 너무 약합니다.');
        } else if (score < 3) {
            feedback.push('비밀번호 강도가 보통입니다.');
        } else if (score < 4) {
            feedback.push('비밀번호 강도가 좋습니다.');
        } else {
            feedback.push('비밀번호 강도가 매우 좋습니다.');
        }

        if (password.length < 12) {
            feedback.push('12자 이상 사용하시면 더 안전합니다.');
        }

        return { score, feedback };
    }

    /**
     * 회원가입 성공 후 안내사항
     */
    getPostRegisterActions(): string[] {
        return [
            '회원가입이 완료되었습니다!',
            '이메일 인증을 진행해주세요.',
            '프로필을 완성하시면 더 나은 서비스를 받을 수 있습니다.'
        ];
    }
}

// 싱글톤 인스턴스 export
export const registerDomainService = new RegisterDomainService();
