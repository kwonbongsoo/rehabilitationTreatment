/**
 * 회원 도메인 서비스
 * 회원 관련 비즈니스 규칙과 도메인 로직을 캡슐화
 */
export class MemberDomainService {
  /**
   * 비밀번호 강도 평가
   */
  evaluatePasswordStrength(password: string): {
    score: number; // 0-4
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let level: 'weak' | 'fair' | 'good' | 'strong';

    if (score < 2) {
      level = 'weak';
      feedback.push('비밀번호가 너무 약합니다.');
    } else if (score < 3) {
      level = 'fair';
      feedback.push('비밀번호 강도가 보통입니다.');
    } else if (score < 4) {
      level = 'good';
      feedback.push('비밀번호 강도가 좋습니다.');
    } else {
      level = 'strong';
      feedback.push('비밀번호 강도가 매우 좋습니다.');
    }

    if (password.length < 12) {
      feedback.push('12자 이상 사용하시면 더 안전합니다.');
    }

    return { score, level, feedback };
  }

  /**
   * 회원가입 성공 후 안내사항
   */
  getPostRegistrationActions(): string[] {
    return [
      '회원가입이 완료되었습니다!',
      '이메일 인증을 진행해주세요.',
      '프로필을 완성하시면 더 나은 서비스를 받을 수 있습니다.',
    ];
  }

  /**
   * 사용자명 정규화
   */
  normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }

  /**
   * 이메일 정규화
   */
  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * 회원 상태 확인
   */
  getMemberStatus(isActive: boolean, isVerified: boolean): 'active' | 'pending' | 'suspended' {
    if (!isActive) return 'suspended';
    if (!isVerified) return 'pending';
    return 'active';
  }
}

// 싱글톤 인스턴스 export
export const memberDomainService = new MemberDomainService();
