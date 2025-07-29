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
  private static instance: MemberService;
  private constructor(private readonly prisma: PrismaClient) {}

  public static getInstance(prisma?: PrismaClient): MemberService {
    if (!MemberService.instance) {
      if (!prisma) {
        throw new Error('PrismaClient instance required for first initialization');
      }
      MemberService.instance = new MemberService(prisma);
    }
    return MemberService.instance;
  }

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
    if (
      typeof id !== 'string' ||
      typeof password !== 'string' ||
      id.trim().length === 0 ||
      password.trim().length === 0
    ) {
      throw new ValidationError('Both ID and password are required');
    }
  }

  async init() {
    const password = await bcrypt.hash('123123123', 10);
    await this.prisma.member.create({
      data: {
        id: 'star12310',
        email: 'star12310@naver.com',
        name: '권봉수',
        password,
      },
    });
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

  async findMany(options: { skip: number; take: number }): Promise<MemberOutput[]> {
    return await this.prisma.member.findMany({
      skip: options.skip,
      take: options.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(skip = 0, take = 10): Promise<MemberOutput[]> {
    return await this.prisma.member.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, updateData: Partial<MemberInput>): Promise<MemberOutput> {
    // 1. 검증: 새로운 데이터가 있는지 확인
    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No update data provided');
    }

    // 2. 비즈니스 규칙 검증
    this.validateUpdateMember(updateData);

    // 트랜잭션으로 데이터 일관성 보장
    return await this.prisma.$transaction(async (tx) => {
      // 3. 기존 멤버 존재 확인
      const existingMember = await tx.member.findUnique({
        where: { id },
      });

      if (!existingMember) {
        throw new MemberNotFoundError(`Member with ID ${id} not found`);
      }

      const processedData: any = { ...updateData };

      // 4. 이메일 중복 확인 (이메일이 변경되는 경우에만)
      if (updateData.email && updateData.email !== existingMember.email) {
        const emailExists = await tx.member.findUnique({
          where: { email: updateData.email },
        });

        if (emailExists) {
          throw new DuplicateValueError('Email');
        }
      }

      // 5. ID 중복 확인 (ID가 변경되는 경우에만)
      if (updateData.id && updateData.id !== existingMember.id) {
        const idExists = await tx.member.findUnique({
          where: { id: updateData.id },
        });

        if (idExists) {
          throw new DuplicateValueError('ID');
        }
      }

      // 6. 비밀번호 해싱 (비밀번호가 변경되는 경우에만)
      if (updateData.password) {
        processedData.password = await this.hashPassword(updateData.password);
      }

      // 7. 멤버 정보 업데이트
      return await tx.member.update({
        where: { id },
        data: processedData,
      });
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.member.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Prisma error code for "Record to delete does not exist"
        throw new MemberNotFoundError(`Member with ID ${id} not found`);
      }
      throw error;
    }
  }

  async authenticate(id: string, password: string): Promise<Omit<MemberOutput, 'password'>> {
    // 1. 입력 검증
    this.validateCredentials(id, password);

    // 2. 멤버 찾기 (findByLoginId는 Not Found 시 예외 발생)
    const member = await this.findByLoginId(id);

    // 3. 비밀번호 검증
    const isPasswordValid = await this.comparePasswords(password, member.password);

    if (!isPasswordValid) {
      throw new AuthenticationError('Password is incorrect');
    }

    // 4. 안전한 멤버 정보 반환 (비밀번호 제외)
    const { password: _, ...safeUserData } = member;
    return safeUserData;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<MemberOutput> {
    // 1. 새 비밀번호 검증
    this.validatePasswordChange(newPassword);

    // 트랜잭션으로 데이터 일관성 보장
    return await this.prisma.$transaction(async (tx) => {
      // 2. 멤버 존재 확인 및 현재 비밀번호 검증
      const member = await tx.member.findUnique({
        where: { id },
      });

      if (!member) {
        throw new MemberNotFoundError(`Member with ID ${id} not found`);
      }

      // 3. 현재 비밀번호 확인
      const isCurrentPasswordValid = await this.comparePasswords(currentPassword, member.password);

      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // 4. 새 비밀번호 해싱 및 업데이트
      const hashedNewPassword = await this.hashPassword(newPassword);

      return await tx.member.update({
        where: { id },
        data: { password: hashedNewPassword },
      });
    });
  }

  async countAll(): Promise<number> {
    return await this.prisma.member.count();
  }
}
