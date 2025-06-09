import { FastifyRequest, FastifyReply } from 'fastify';
import { memberController } from '../controllers/memberController';
import { ValidationError, AuthenticationError } from '@ecommerce/common';
import { MemberParams, MemberBody } from '../types';

// Mock the MemberService module
jest.mock('../services/memberService', () => ({
  MemberService: {
    createMember: jest.fn(),
    getMember: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn(),
  },
}));

import { MemberService } from '../services/memberService';

describe('멤버 컨트롤러', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    // 각 테스트 전에 모든 모킹 초기화
    jest.clearAllMocks();

    mockRequest = {
      params: { id: 'test-id' },
      query: {},
      body: { name: 'Test User', email: 'test@example.com' },
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

    // createMember 메서드가 에러를 발생시키도록 모킹
    (MemberService.createMember as jest.Mock).mockRejectedValueOnce(error);

    try {
      await memberController.createMember(
        mockRequest as FastifyRequest<{ Body: MemberBody }>,
        mockReply as FastifyReply,
      );
    } catch (thrownError) {
      // 컨트롤러가 에러를 다시 던져야 함
      expect(thrownError).toBe(error);
    }

    expect(MemberService.createMember).toHaveBeenCalledWith(mockRequest.body);
  });

  it('AuthenticationError를 올바르게 처리해야 함', async () => {
    const error = new AuthenticationError('Invalid token');
    (MemberService.getMember as jest.Mock).mockRejectedValueOnce(error);

    try {
      await memberController.getMember(
        mockRequest as FastifyRequest<{ Params: MemberParams }>,
        mockReply as FastifyReply,
      );
    } catch (thrownError) {
      // 컨트롤러가 에러를 다시 던져야 함
      expect(thrownError).toBe(error);
    }

    expect(MemberService.getMember).toHaveBeenCalledWith((mockRequest.params as MemberParams).id);
  });

  it('알 수 없는 에러를 올바르게 처리해야 함', async () => {
    const error = new Error('Unknown error');
    (MemberService.updateMember as jest.Mock).mockRejectedValueOnce(error);

    try {
      await memberController.updateMember(
        mockRequest as FastifyRequest<{ Params: MemberParams; Body: MemberBody }>,
        mockReply as FastifyReply,
      );
    } catch (thrownError) {
      // 컨트롤러가 에러를 다시 던져야 함
      expect(thrownError).toBe(error);
    }

    expect(MemberService.updateMember).toHaveBeenCalledWith(
      (mockRequest.params as MemberParams).id,
      mockRequest.body
    );
  });
});
