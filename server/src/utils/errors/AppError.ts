export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request") {
        super(message, 400);
    }
}

export class InvalidActionError extends AppError {
    constructor(message: string = "Invalid Action") {
        super(message, 400);
    }
}

export class ResourceAlreadyExistsError extends AppError {
    constructor(message: string = "Resource Already Exists") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403);
    }
}

export class RouteNotFoundError extends AppError {
    constructor(message: string = "Route Not Found") {
        super(message, 404);
    }
}

export class ResourceNotFoundError extends AppError {
    constructor(message: string = "Resource Not Found") {
        super(message, 404);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Internal Server Error") {
        super(message, 500, false);
    }
}

export class ValidationError extends AppError {
    public readonly details: unknown;

    constructor(details: unknown, message: string = "Validation Error") {
        super(message, 400);
        this.details = details;
    }
}