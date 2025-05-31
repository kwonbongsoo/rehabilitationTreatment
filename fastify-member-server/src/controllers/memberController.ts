import { FastifyRequest, FastifyReply } from 'fastify';
import { IMemberService } from '../interfaces/memberService';
import {
    MemberInput,
    MemberOutput,
    MemberResponse,
    SuccessResponse,
    ErrorResponse,
    AuthResponse,
    PaginationQuery,
    PaginatedResult,
    isMemberInput,
    hasIdParam,
    ValidationError,
    Constants
} from '../types/member';
import { withErrorHandling } from '../utils/controllerUtils';

export class MemberController {
    // 클래스 레벨 상수 정의
    private static readonly LOG_PREFIXES = {
        CREATE: 'Creating member:',
        READ: 'Fetching member:',
        LIST: 'Listing members:',
        UPDATE: 'Updating member:',
        DELETE: 'Deleting member:',
        AUTH: 'Authenticating:',
        PASSWORD: 'Password operation:'
    };

    constructor(private readonly memberService: IMemberService) { }

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
        return memberResponse;
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

    private extractPaginationParams = (request: FastifyRequest): { skip: number, take: number } => {
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
            take: Math.min(Math.max(1, take), MAX_PAGE_SIZE) // 범위 강제 적용
        };
    };

    // 로깅 유틸리티
    private logOperation = (request: FastifyRequest, prefix: string, message: string): void => {
        request.log.info(`${prefix} ${message}`);
    };

    // 에러 맵핑 객체
    private readonly errorHandlers: Record<string, (error: Error, reply: FastifyReply) => void> = {
        'MemberNotFoundError': (error, reply) => {
            reply.code(404).send(this.createErrorResponse(error.message));
        },
        'DuplicateValueError': (error, reply) => {
            reply.code(409).send(this.createErrorResponse(error.message));
        },
        'AuthenticationError': (error, reply) => {
            reply.code(401).send(this.createErrorResponse(error.message));
        },
        'ValidationError': (error, reply) => {
            const validationError = error as ValidationError;
            reply.code(400).send(
                this.createErrorResponse(error.message, 'VALIDATION_ERROR')
            );
        }
    };

    // 통합된 에러 처리 메서드
    private handleError = (error: unknown, request: FastifyRequest, reply: FastifyReply): void => {
        // 더 안전한 에러 처리
        if (!(error instanceof Error)) {
            request.log.error('Unknown error type:', error);
            reply.code(500).send(this.createErrorResponse('Internal server error', 'INTERNAL_ERROR'));
            return;
        }

        request.log.error(error);

        const errorType = error.constructor.name;
        const handler = this.errorHandlers[errorType];

        if (handler) {
            handler(error, reply);
            return;
        }

        reply.code(500).send(this.createErrorResponse('Internal server error', 'INTERNAL_ERROR'));
    };

    // 멤버 생성
    public createMember = withErrorHandling(
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const body = request.body;

            // 타입 가드로 HTTP 요청 구조 검증
            if (!isMemberInput(body)) {
                reply.code(400).send(this.createErrorResponse(
                    'Invalid member data format',
                    'INVALID_INPUT'
                ));
                return;
            }

            this.logOperation(request, MemberController.LOG_PREFIXES.CREATE, `new member with ID: ${body.id}`);
            const newMember = await this.memberService.create(body);

            this.logOperation(request, MemberController.LOG_PREFIXES.CREATE, `successful for UID: ${newMember.uid}`);

            reply.code(201).send(this.createSuccessResponse(
                this.toMemberResponse(newMember),
                'Member created successfully'
            ));
        },
        this.handleError
    );

    // 단일 멤버 조회
    public getMember = withErrorHandling(
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const id = this.extractIdParam(request);
            this.logOperation(request, MemberController.LOG_PREFIXES.READ, `ID: ${id}`);

            const member = await this.memberService.findById(id);

            reply.send(this.createSuccessResponse(this.toMemberResponse(member)));
        },
        this.handleError
    );

    // 멤버 목록 조회 - 페이지네이션 개선
    public getAllMembers = withErrorHandling(
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const { skip, take } = this.extractPaginationParams(request);
            this.logOperation(request, MemberController.LOG_PREFIXES.LIST, `skip: ${skip}, take: ${take}`);

            // Promise.all을 사용한 병렬 요청
            const [members, total] = await Promise.all([
                this.memberService.findAll(skip, take),
                this.memberService.countAll()
            ]);

            const page = Math.floor(skip / take) + 1;
            const pageCount = Math.ceil(total / take);

            const paginatedResult: PaginatedResult<MemberResponse> = {
                items: this.toMemberResponses(members),
                total,
                page,
                pageSize: take,
                pageCount
            };

            reply.send(this.createSuccessResponse(paginatedResult));
        },
        this.handleError
    );

    // 멤버 정보 업데이트
    public updateMember = withErrorHandling(
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const id = this.extractIdParam(request);
            // body의 타입 검증 로직 추가
            const updateData = request.body;

            // 부분적 업데이트 데이터 타입 검증
            if (typeof updateData !== 'object' || updateData === null) {
                reply.code(400).send(this.createErrorResponse(
                    'Invalid update data format',
                    'INVALID_INPUT'
                ));
                return;
            }

            this.logOperation(request, MemberController.LOG_PREFIXES.UPDATE, `ID: ${id}`);
            const updatedMember = await this.memberService.update(id, updateData as Partial<MemberInput>);

            reply.send(this.createSuccessResponse(
                this.toMemberResponse(updatedMember),
                'Member updated successfully'
            ));
        },
        this.handleError
    );

    // 멤버 삭제
    public deleteMember = withErrorHandling(
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const id = this.extractIdParam(request);
            this.logOperation(request, MemberController.LOG_PREFIXES.DELETE, `ID: ${id}`);

            await this.memberService.delete(id);

            reply.code(204).send();
        },
        this.handleError
    );

    // 로그인/인증
    public authenticateMember = withErrorHandling(
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const body = request.body;

            // 인증 요청 데이터 검증
            if (!body || typeof body !== 'object' || !('id' in body) || !('password' in body)) {
                reply.code(400).send(this.createErrorResponse(
                    'Invalid authentication request',
                    'INVALID_INPUT'
                ));
                return;
            }

            const { id, password } = body as { id: string; password: string };

            this.logOperation(request, MemberController.LOG_PREFIXES.AUTH, `user: ${id}`);
            const authenticatedMember = await this.memberService.authenticate(id, password);

            const response: AuthResponse = {
                success: true,
                member: this.toMemberResponse(authenticatedMember as MemberOutput)
            };

            reply.send(response);
        },
        this.handleError
    );

    // 비밀번호 변경
    public changePassword = withErrorHandling(
        async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
            const id = this.extractIdParam(request);
            const body = request.body;

            // 비밀번호 변경 요청 데이터 검증
            if (!body || typeof body !== 'object' ||
                !('currentPassword' in body) || !('newPassword' in body)) {
                reply.code(400).send(this.createErrorResponse(
                    'Invalid password change request',
                    'INVALID_INPUT'
                ));
                return;
            }

            const { currentPassword, newPassword } = body as {
                currentPassword: string;
                newPassword: string
            };

            this.logOperation(request, MemberController.LOG_PREFIXES.PASSWORD, `change for member: ${id}`);
            await this.memberService.changePassword(id, currentPassword, newPassword);

            reply.send(this.createSuccessResponse(
                null,
                'Password changed successfully'
            ));
        },
        this.handleError
    );
}