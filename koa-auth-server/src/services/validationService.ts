import { LoginBody, UserRole } from '../interfaces/auth';
import { ValidationError, BaseError, ErrorCode } from '../middlewares/errorMiddleware';

export class ValidationService {
    /**
     * 로그인 자격 증명 유효성 검사
     */
    public validateCredentials(credentials: LoginBody): void {
        const { id, password } = credentials;
        const errors: Record<string, string> = {};

        if (!id) {
            errors.id = 'Id is required';
        } else if (id.length < 3) {
            errors.id = 'Id must be at least 3 characters';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        } if (Object.keys(errors).length > 0) {
            // ValidationError는 single field validation을 위한 것이므로, 
            // 여러 필드 오류가 있을 때는 첫 번째 필드의 오류를 사용
            const firstField = Object.keys(errors)[0];
            throw new ValidationError('Validation failed', {
                field: firstField,
                reason: errors[firstField]
            });
        }
    }

    /**
     * 사용자 역할 검증
     */    public validateRole(role: UserRole, allowedRoles: UserRole[]): void {
        if (!allowedRoles.includes(role)) {
            throw new BaseError(
                ErrorCode.INTERNAL_ERROR,
                `Role ${role} is not allowed for this operation`,
                undefined,
                403
            );
        }
    }
}