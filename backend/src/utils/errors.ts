export class AppError extends Error {
  constructor(
    public statusCode: number,
    public status: string,
    message: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, 'error', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(401, 'error', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, 'error', message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, 'error', message);
  }
} 