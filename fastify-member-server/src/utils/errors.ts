export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(400, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}