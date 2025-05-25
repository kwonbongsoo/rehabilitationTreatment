import { LoginBody, UserRole } from '../interfaces/auth';
import { ValidationError, BusinessError } from '../middlewares/errorMiddleware';

export class ValidationService {
    /**
     * 로그인 자격 증명 유효성 검사
     */
    public validateCredentials(credentials: LoginBody): void {
        const { username, password } = credentials;
        const errors: Record<string, string> = {};

        if (!username) {
            errors.username = 'Username is required';
        } else if (username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationError('Validation failed', errors);
        }
    }

    /**
     * 사용자 역할 검증
     */
    public validateRole(role: UserRole, allowedRoles: UserRole[]): void {
        if (!allowedRoles.includes(role)) {
            throw new BusinessError(
                `Role ${role} is not allowed for this operation`,
                403,
                'FORBIDDEN_ROLE'
            );
        }
    }
}