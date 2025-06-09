import { PrismaClient } from '@prisma/client';
import {
  MemberInput,
  MemberOutput,
  MemberNotFoundError,
  DuplicateValueError,
  AuthenticationError,
  Constants,
  ValidationError,
} from '../types/member';
import { IMemberService } from '../interfaces/memberService';
import bcrypt from 'bcryptjs';

export class MemberService implements IMemberService {
  constructor(private readonly prisma: PrismaClient) { }

  // ===== 유틸리티 함수 (코드 상단으로 이동) =====
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 중복 검증 로직을 추출한 유틸리티 메서드
  private validateField(
    value: string | undefined,
    minLength: number,
    fieldName: string,
    errors: Record<string, string>,
    required = false,
  ): void {
    if (value === undefined) {
      if (required) {
        errors[fieldName.toLowerCase()] = `${fieldName} is required`;
      }
      return;
    }

    if (value.length < minLength) {
      errors[fieldName.toLowerCase()] = `${fieldName} must be at least ${minLength} characters`;
    }
  }

  // ===== 검증 메서드 =====
  private validateCreateMember(data: MemberInput): void {
    const validationErrors: Record<string, string> = {};

    this.validateField(data.id, Constants.VALIDATION.MIN_ID_LENGTH, 'ID', validationErrors, true);
    this.validateField(
      data.name,
      Constants.VALIDATION.MIN_NAME_LENGTH,
      'Name',
      validationErrors,
      true,
    );
    this.validateField(
      data.password,
      Constants.VALIDATION.MIN_PASSWORD_LENGTH,
      'Password',
      validationErrors,
      true,
    );

    if (!data.email) {
      validationErrors.email = 'Email is required';
    } else if (!this.isValidEmail(data.email)) {
      validationErrors.email = 'Invalid email format';
    }

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError('Validation failed', validationErrors);
    }
  }

  private validateUpdateMember(data: Partial<MemberInput>): void {
    const validationErrors: Record<string, string> = {};

    this.validateField(data.id, Constants.VALIDATION.MIN_ID_LENGTH, 'ID', validationErrors);
    this.validateField(data.name, Constants.VALIDATION.MIN_NAME_LENGTH, 'Name', validationErrors);
    this.validateField(
      data.password,
      Constants.VALIDATION.MIN_PASSWORD_LENGTH,
      'Password',
      validationErrors,
    );

    if (data.email !== undefined && !this.isValidEmail(data.email)) {
      validationErrors.email = 'Invalid email format';
    }

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError('Validation failed', validationErrors);
    }
  }

  private validatePasswordChange(newPassword: string): void {
    const validationErrors: Record<string, string> = {};

    this.validateField(
      newPassword,
      Constants.VALIDATION.MIN_PASSWORD_LENGTH,
      'New password',
      validationErrors,
      true,
    );

    if (Object.keys(validationErrors).length > 0) {
      throw new ValidationError('Validation failed', validationErrors);
    }
  }

  private validateCredentials(id: string, password: string): void {
    if (!id || !password) {
      throw new ValidationError('Both ID and password are required');
    }
  }

  // ===== 공개 API 메서드 =====
  async create(data: MemberInput): Promise<MemberOutput> {
    // 1. 비즈니스 규칙 검증
    this.validateCreateMember(data);

    // 트랜잭션으로 중복 검증과 생성을 원자적으로 처리
    return await this.prisma.$transaction(async (tx) => {
      // 2. 이메일과 ID 중복 확인 (단일 쿼리로 최적화)
      const [existingEmail, existingId] = await Promise.all([
        tx.member.findUnique({ where: { email: data.email } }),
        tx.member.findUnique({ where: { id: data.id } }),
      ]);

      // 3. 중복 검증
      if (existingEmail) {
        throw new DuplicateValueError('Email');
      }

      if (existingId) {
        throw new DuplicateValueError('ID');
      }

      // 4. 비밀번호 해싱
      const hashedPassword = await this.hashPassword(data.password);

      // 5. 멤버 생성
      return await tx.member.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
    });
  }

  async findById(id: string): Promise<MemberOutput> {
    const member = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      throw new MemberNotFoundError(`Member with ID ${id} not found`);
    }

    return member;
  }

  async findByLoginId(loginId: string): Promise<MemberOutput> {
    const member = await this.prisma.member.findUnique({
      where: { id: loginId },
    });

    if (!member) {
      throw new MemberNotFoundError(`Member with login ID ${loginId} not found`);
    }

    return member;
  }

  async findByEmail(email: string): Promise<MemberOutput> {
    const member = await this.prisma.member.findUnique({
      where: { email },
    });

    if (!member) {
      throw new MemberNotFoundError(`Member with email ${email} not found`);
    }

    return member;
  }

  async findAll(skip = 0, take = 10): Promise<MemberOutput[]> {
    return await this.prisma.member.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateData: Partial<MemberInput>): Promise<MemberOutput> {
    // 1. 비즈니스 규칙 검증
    this.validateUpdateMember(updateData);

    // 트랜잭션으로 업데이트 작업 원자성 보장
    return await this.prisma.$transaction(async (tx) => {
      // 2. 멤버 존재 확인
      const existingMember = await tx.member.findUnique({
        where: { id },
      });

      if (!existingMember) {
        throw new MemberNotFoundError(`Member with ID ${id} not found`);
      }

      // 3. 이메일과 ID 중복 검사 병렬 처리
      const duplicateChecks = [];

      if (updateData.email) {
        duplicateChecks.push(
          tx.member
            .findFirst({
              where: {
                email: updateData.email,
                NOT: { id },
              },
            })
            .then((result) => {
              if (result) throw new DuplicateValueError('Email');
            }),
        );
      }

      if (updateData.id) {
        duplicateChecks.push(
          tx.member
            .findFirst({
              where: {
                id: updateData.id,
                NOT: { id },
              },
            })
            .then((result) => {
              if (result) throw new DuplicateValueError('ID');
            }),
        );
      }

      // 병렬 처리된 중복 검사 대기
      if (duplicateChecks.length > 0) {
        await Promise.all(duplicateChecks);
      }

      // 4. 비밀번호 업데이트 시 해싱
      let dataToUpdate = { ...updateData };
      if (updateData.password) {
        dataToUpdate.password = await this.hashPassword(updateData.password);
      }

      // 5. 멤버 정보 업데이트
      return await tx.member.update({
        where: { id },
        data: dataToUpdate,
      });
    });
  }

  async delete(id: string): Promise<boolean> {
    // 트랜잭션으로 검사와 삭제를 원자적으로 처리
    await this.prisma.$transaction(async (tx) => {
      // 멤버 존재 확인
      const existingMember = await tx.member.findUnique({
        where: { id },
      });

      if (!existingMember) {
        throw new MemberNotFoundError(`Member with ID ${id} not found`);
      }

      // 멤버 삭제
      await tx.member.delete({
        where: { id },
      });
    });

    return true;
  }

  async authenticate(id: string, password: string): Promise<Omit<MemberOutput, 'password'>> {
    // 1. 인증 데이터 유효성 검증
    this.validateCredentials(id, password);

    try {
      // 2. ID로 멤버 조회
      const member = await this.findByLoginId(id);

      // 3. 비밀번호 확인
      const passwordMatch = await this.comparePasswords(password, member.password);

      if (!passwordMatch) {
        throw new AuthenticationError('Invalid credentials');
      }

      // 4. 인증 성공 - 비밀번호 제외하고 반환
      const { password: _, ...memberData } = member;
      return memberData;
    } catch (error) {
      if (error instanceof MemberNotFoundError) {
        // 로그인 실패 시 일반 인증 오류로 변환 (보안 목적)
        throw new AuthenticationError('Invalid credentials');
      }
      throw error;
    }
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<MemberOutput> {
    // 1. 새 비밀번호 검증
    this.validatePasswordChange(newPassword);

    // 트랜잭션으로 검사와 변경을 원자적으로 처리
    return await this.prisma.$transaction(async (tx) => {
      // 2. 멤버 조회
      const member = await tx.member.findUnique({
        where: { id },
      });

      if (!member) {
        throw new MemberNotFoundError(`Member with ID ${id} not found`);
      }

      // 3. 현재 비밀번호 확인
      const passwordMatch = await this.comparePasswords(currentPassword, member.password);

      if (!passwordMatch) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // 4. 새 비밀번호 해싱 및 업데이트
      const hashedPassword = await this.hashPassword(newPassword);

      return await tx.member.update({
        where: { id },
        data: { password: hashedPassword },
      });
    });
  }

  async countAll(): Promise<number> {
    return await this.prisma.member.count();
  }

  static async createMember(data: MemberInput): Promise<MemberOutput> {
    // TODO: Implement member creation logic
    throw new ValidationError('Not implemented', {
      field: 'service',
      reason: 'Method not implemented',
    });
  }

  static async getMember(id: string): Promise<MemberOutput> {
    // TODO: Implement member retrieval logic
    throw new ValidationError('Not implemented', {
      field: 'service',
      reason: 'Method not implemented',
    });
  }

  static async updateMember(id: string, data: MemberInput): Promise<MemberOutput> {
    // TODO: Implement member update logic
    throw new ValidationError('Not implemented', {
      field: 'service',
      reason: 'Method not implemented',
    });
  }

  static async deleteMember(id: string): Promise<void> {
    // TODO: Implement member deletion logic
    throw new ValidationError('Not implemented', {
      field: 'service',
      reason: 'Method not implemented',
    });
  }
}
