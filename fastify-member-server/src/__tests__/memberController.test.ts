import { FastifyRequest, FastifyReply } from 'fastify';
import { MemberController } from '../controllers/memberController';
import { ValidationError, AuthenticationError } from '@ecommerce/common';
import { MemberParams, MemberBody, MemberInput, MemberOutput } from '../types/member';
import { IMemberService } from '../interfaces/memberService';

// Mock MemberService
const mockMemberService: jest.Mocked<IMemberService> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByLoginId: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  findMany: jest.fn(),
  countAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  authenticate: jest.fn(),
  changePassword: jest.fn(),
};

describe('멤버 컨트롤러', () => {
  let memberController: MemberController;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    // 각 테스트 전에 모든 모킹 초기화
    jest.clearAllMocks();

    // 싱글톤 인스턴스 생성
    memberController = MemberController.getInstance(mockMemberService);

    mockRequest = {
      params: { id: 'test-id' },
      query: {},
      body: {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
      headers: {},
      log: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        fatal: jest.fn(),
        child: jest.fn(),
        level: 'info',
        silent: jest.fn(),
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      log: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        fatal: jest.fn(),
        child: jest.fn(),
        level: 'info',
        silent: jest.fn(),
      },
    };
  });

  it('ValidationError를 올바르게 처리해야 함', async () => {
    const error = new ValidationError('Invalid input', {
      field: 'email',
      reason: 'Invalid format',
    });

    // create 메서드가 에러를 발생시키도록 모킹
    mockMemberService.create.mockRejectedValueOnce(error);

    await memberController.createMember(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockMemberService.create).toHaveBeenCalledWith(mockRequest.body);
    expect(mockReply.code).toHaveBeenCalledWith(400);
  });

  it('멤버 조회가 성공해야 함', async () => {
    const mockMember: MemberOutput = {
      uid: 'uid-123',
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockMemberService.findById.mockResolvedValueOnce(mockMember);

    await memberController.getMember(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockMemberService.findById).toHaveBeenCalledWith('test-id');
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('멤버 업데이트가 성공해야 함', async () => {
    const mockMember: MemberOutput = {
      uid: 'uid-123',
      id: 'test-id',
      name: 'Updated User',
      email: 'updated@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockMemberService.update.mockResolvedValueOnce(mockMember);

    await memberController.updateMember(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockMemberService.update).toHaveBeenCalledWith('test-id', mockRequest.body);
    expect(mockReply.send).toHaveBeenCalled();
  });
});
