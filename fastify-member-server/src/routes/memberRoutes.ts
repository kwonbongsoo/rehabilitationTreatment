import { FastifyInstance } from 'fastify';
import { MemberController } from '../controllers/memberController';

// 공통 스키마 정의
const idParamSchema = {
    type: 'object',
    required: ['id'],
    properties: {
        id: { type: 'string' }
    }
};

const memberSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
};

// 오류 응답 스키마 정의
const errorResponseSchema = {
    type: 'object',
    required: ['success', 'error'],
    properties: {
        success: { type: 'boolean', enum: [false] },
        error: { type: 'string' },
        code: { type: 'string' }
    }
};

// 성공 응답 스키마 - data 필드 추가
const successResponseSchema = {
    type: 'object',
    required: ['success'],
    properties: {
        success: { type: 'boolean', enum: [true] },
        data: { type: ['object', 'null'] }, // null도 허용
        message: { type: 'string' }
    }
};

// 멤버 객체가 data 필드에 들어가는 경우의 응답 스키마
const memberResponseSchema = {
    type: 'object',
    required: ['success', 'data'],
    properties: {
        success: { type: 'boolean', enum: [true] },
        data: memberSchema,
        message: { type: 'string' }
    }
};

// 멤버 배열이 data 필드에 들어가는 경우의 응답 스키마
const memberArrayResponseSchema = {
    type: 'object',
    required: ['success', 'data'],
    properties: {
        success: { type: 'boolean', enum: [true] },
        data: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    items: memberSchema
                },
                total: { type: 'integer' },
                page: { type: 'integer' },
                pageSize: { type: 'integer' },
                pageCount: { type: 'integer' }
            }
        },
        message: { type: 'string' }
    }
};

export default function memberRoutes(controller: MemberController) {
    return async function (fastify: FastifyInstance): Promise<void> {
        // 멤버 생성
        fastify.post('/', {
            schema: {
                tags: ['members'],
                body: {
                    type: 'object',
                    required: ['id', 'email', 'name', 'password'],
                    properties: {
                        id: { type: 'string', minLength: 3 },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string', minLength: 2 },
                        password: { type: 'string', minLength: 6 }
                    }
                },
                response: {
                    201: memberResponseSchema, // 수정: 래퍼 객체 포함 스키마
                    400: errorResponseSchema,
                    409: errorResponseSchema
                }
            },
            handler: controller.createMember
        });

        // 모든 멤버 조회
        fastify.get('/', {
            schema: {
                tags: ['members'],
                querystring: {
                    type: 'object',
                    properties: {
                        skip: { type: 'integer', minimum: 0 },
                        take: { type: 'integer', minimum: 1, maximum: 100 }
                    }
                },
                response: {
                    200: memberArrayResponseSchema,
                    500: errorResponseSchema
                }
            },
            handler: controller.getAllMembers
        });

        // 단일 멤버 조회
        fastify.get('/:id', {
            schema: {
                tags: ['members'],
                params: idParamSchema,
                response: {
                    200: memberResponseSchema, // 수정: 래퍼 객체 포함 스키마
                    404: errorResponseSchema
                }
            },
            handler: controller.getMember
        });

        // 멤버 정보 수정
        fastify.patch('/:id', {
            schema: {
                tags: ['members'],
                params: idParamSchema,
                body: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string', minLength: 2 }
                    }
                },
                response: {
                    200: memberResponseSchema, // 수정: 래퍼 객체 포함 스키마
                    404: errorResponseSchema,
                    409: errorResponseSchema
                }
            },
            handler: controller.updateMember
        });

        // 멤버 삭제
        fastify.delete('/:id', {
            schema: {
                tags: ['members'],
                params: idParamSchema,
                response: {
                    204: { type: 'null' }, // 204 응답은 바디가 비어있으므로 그대로 둠
                    404: errorResponseSchema
                }
            },
            handler: controller.deleteMember
        });

        // 비밀번호 변경
        fastify.post('/:id/change-password', {
            schema: {
                tags: ['members'],
                params: idParamSchema,
                body: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: { type: 'string' },
                        newPassword: { type: 'string', minLength: 6 }
                    }
                },
                response: {
                    200: successResponseSchema,
                    401: errorResponseSchema,
                    404: errorResponseSchema
                }
            },
            handler: controller.changePassword
        });

        // 인증
        fastify.post('/verify', {
            schema: {
                tags: ['members'],
                body: {
                    type: 'object',
                    required: ['id', 'password'],
                    properties: {
                        id: { type: 'string' },
                        password: { type: 'string' }
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            member: memberSchema,
                            message: { type: 'string' },
                            error: { type: 'string' }
                        }
                    },
                    401: errorResponseSchema
                }
            },
            handler: controller.authenticateMember
        });
    }
}