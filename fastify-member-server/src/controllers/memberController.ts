import { FastifyRequest, FastifyReply } from 'fastify';
import { IMemberService } from '../interfaces/memberService';
import {
  MemberInput,
  MemberOutput,
  MemberResponse,
  MemberParams,
  MemberBody,
  SuccessResponse,
  ErrorResponse,
  AuthResponse,
  PaginationQuery,
  PaginatedResult,
  isMemberInput,
  hasIdParam,
  ValidationError,
  AuthenticationError,
  MemberNotFoundError,
  DuplicateValueError,
  Constants,
} from '../types/member';
import { withErrorHandling } from '../utils/controllerUtils';
import { BaseError, ErrorCode } from '@ecommerce/common';

export class MemberController {
  private static instance: MemberController;

  private readonly errorHandlers: Record<string, (error: Error, reply: FastifyReply) => void>;

  private constructor(private readonly memberService: IMemberService) {
    this.errorHandlers = {
      ValidationError: (error: Error, reply: FastifyReply) => {
        const httpError = error as ValidationError;
        reply.code(httpError.statusCode).send(httpError.toResponse());
      },
      AuthenticationError: (error: Error, reply: FastifyReply) => {
        const httpError = error as AuthenticationError;
        reply.code(httpError.statusCode).send(httpError.toResponse());
      },
      MemberNotFoundError: (error: Error, reply: FastifyReply) => {
        const httpError = error as MemberNotFoundError;
        reply.code(httpError.statusCode).send(httpError.toResponse());
      },
      DuplicateValueError: (error: Error, reply: FastifyReply) => {
        const httpError = error as DuplicateValueError;
        reply.code(httpError.statusCode).send(httpError.toResponse());
      },
    };
  }

  public static getInstance(memberService?: IMemberService): MemberController {
    if (!MemberController.instance) {
      if (!memberService) {
        throw new Error('MemberService instance required for first initialization');
      }
      MemberController.instance = new MemberController(memberService);
    }
    return MemberController.instance;
  }

  // 유틸리티 메서드: 표준화된 응답 생성 함수
  private createSuccessResponse = <T>(data: T, message?: string): SuccessResponse<T> => {
    return { success: true, data, ...(message && { message }) };
  };

  private createErrorResponse = (error: string, code?: string): ErrorResponse => {
    return { success: false, error, ...(code && { code }) };
  };

  // 유틸리티 메서드: DB 출력을 API 응답으로 변환
  private toMemberResponse = (member: MemberOutput): MemberResponse => {
    // Omit 타입을 사용하여 타입 단언 제거
    const { uid, password, ...memberResponse } = member;
    // Date 객체를 명시적으로 문자열로 변환
    return {
      ...memberResponse,
      createdAt:
        memberResponse.createdAt instanceof Date
          ? memberResponse.createdAt.toISOString()
          : memberResponse.createdAt,
      updatedAt:
        memberResponse.updatedAt instanceof Date
          ? memberResponse.updatedAt.toISOString()
          : memberResponse.updatedAt,
    };
  };

  private toMemberResponses = (members: MemberOutput[]): MemberResponse[] => {
    return members.map(this.toMemberResponse);
  };

  // HTTP 요청 파라미터 추출 유틸리티
  private extractIdParam = (request: FastifyRequest): string => {
    const params = request.params;
    if (!hasIdParam(params)) {
      throw new ValidationError('Invalid request: Missing id parameter');
    }
    return params.id;
  };

  private extractPaginationParams = (request: FastifyRequest): { skip: number; take: number } => {
    const query = request.query as PaginationQuery;
    const { DEFAULT_SKIP, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = Constants.PAGINATION;

    // 더 안전한 타입 변환
    const parseNumber = (value: unknown, defaultValue: number): number => {
      if (value === undefined || value === null) return defaultValue;
      const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const skip = parseNumber(query.skip, DEFAULT_SKIP);
    const take = parseNumber(query.take, DEFAULT_PAGE_SIZE);

    return {
      skip: Math.max(0, skip), // 음수값 방지
      take: Math.min(Math.max(1, take), MAX_PAGE_SIZE), // 범위 강제 적용
    };
  };

  // 통합된 에러 처리 메서드
  private handleError = (error: unknown, request: FastifyRequest, reply: FastifyReply): void => {
    if (!(error instanceof Error)) {
      request.log.error('Unknown error type:', error);
      const internalError = new BaseError(ErrorCode.INTERNAL_ERROR, 'Internal server error');
      reply.code(500).send(internalError.toResponse());
      return;
    }

    request.log.error(error);

    const errorType = error.constructor.name;
    const handler = this.errorHandlers[errorType];

    if (handler) {
      handler(error, reply);
      return;
    }

    const internalError = new BaseError(
      ErrorCode.INTERNAL_ERROR,
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    );
    reply.code(500).send(internalError.toResponse());
  };

  // 멤버 생성
  public createMember = withErrorHandling(
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const body = request.body;

      // 타입 가드로 HTTP 요청 구조 검증
      if (!isMemberInput(body)) {
        reply
          .code(400)
          .send(this.createErrorResponse('Invalid member data format', 'INVALID_INPUT'));
        return;
      }

      const newMember = await this.memberService.create(body);

      const response = this.createSuccessResponse(
        this.toMemberResponse(newMember),
        'Member created successfully',
      );

      const jsonString = JSON.stringify(response);
      reply.code(201).header('content-type', 'application/json').send(jsonString);
    },
    this.handleError,
  );

  // 멤버 조회
  public getMember = withErrorHandling(
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const id = this.extractIdParam(request);

      const member = await this.memberService.findById(id);
      const response = this.createSuccessResponse(this.toMemberResponse(member));

      const jsonString = JSON.stringify(response);
      reply.code(200).header('content-type', 'application/json').send(jsonString);
    },
    this.handleError,
  );

  // 전체 멤버 목록 조회 (페이지네이션 적용)
  public getAllMembers = withErrorHandling(
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { skip, take } = this.extractPaginationParams(request);

      // Promise.all로 병렬 실행
      const [members, totalCount] = await Promise.all([
        this.memberService.findMany({ skip, take }),
        this.memberService.countAll(),
      ]);

      const paginatedResult: PaginatedResult<MemberResponse> = {
        data: this.toMemberResponses(members),
        pagination: {
          skip,
          take,
          total: totalCount,
          hasMore: skip + take < totalCount,
        },
      };

      const response = this.createSuccessResponse(
        paginatedResult,
        `Retrieved ${members.length} members`,
      );

      const jsonString = JSON.stringify(response);
      reply.code(200).header('content-type', 'application/json').send(jsonString);
    },
    this.handleError,
  );

  // 멤버 수정
  public updateMember = withErrorHandling(
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const id = this.extractIdParam(request);
      const updateData = request.body as Partial<MemberInput>;

      const updatedMember = await this.memberService.update(id, updateData);
      const response = this.createSuccessResponse(
        this.toMemberResponse(updatedMember),
        'Member updated successfully',
      );

      const jsonString = JSON.stringify(response);
      reply.code(200).header('content-type', 'application/json').send(jsonString);
    },
    this.handleError,
  );

  // 멤버 삭제
  public deleteMember = withErrorHandling(
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const id = this.extractIdParam(request);

      await this.memberService.delete(id);
      reply.code(204).send();
    },
    this.handleError,
  );

  // 멤버 인증
  public authenticateMember = withErrorHandling(
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id, password } = request.body as { id: string; password: string };

      const memberData = await this.memberService.authenticate(id, password);

      // authenticate는 이미 password가 제거된 안전한 데이터를 반환하므로 직접 사용
      const memberResponse: MemberResponse = {
        id: memberData.id,
        email: memberData.email,
        name: memberData.name,
        createdAt:
          memberData.createdAt instanceof Date
            ? memberData.createdAt.toISOString()
            : memberData.createdAt,
        updatedAt:
          memberData.updatedAt instanceof Date
            ? memberData.updatedAt.toISOString()
            : memberData.updatedAt,
      };

      const response = this.createSuccessResponse(memberResponse, 'Authentication successful');

      const jsonString = JSON.stringify(response);
      reply.code(200).header('content-type', 'application/json').send(jsonString);
    },
    this.handleError,
  );

  // 비밀번호 변경
  public changePassword = withErrorHandling(
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const id = this.extractIdParam(request);
      const { currentPassword, newPassword } = request.body as {
        currentPassword: string;
        newPassword: string;
      };

      const updatedMember = await this.memberService.changePassword(
        id,
        currentPassword,
        newPassword,
      );

      const response = this.createSuccessResponse(
        this.toMemberResponse(updatedMember),
        'Password changed successfully',
      );

      const jsonString = JSON.stringify(response);
      reply.code(200).header('content-type', 'application/json').send(jsonString);
    },
    this.handleError,
  );
}
