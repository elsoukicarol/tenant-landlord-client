export type ApiErrorEnvelope = {
  success?: false;
  data?: null;
  message?: string;
  statusCode?: number;
  errors?: string[];
  details?: Record<string, unknown>;
  timestamp?: string;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: string[];
  readonly details: Record<string, unknown>;

  constructor(
    statusCode: number,
    message: string,
    errors: string[] = [],
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }
  get isForbidden(): boolean {
    return this.statusCode === 403;
  }
  get isLocked(): boolean {
    return this.statusCode === 423;
  }
  get isConflict(): boolean {
    return this.statusCode === 409;
  }
  get isValidation(): boolean {
    return this.statusCode === 400;
  }
  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /** For 423 lockout responses, the ISO timestamp when the account unlocks. */
  get lockoutUntil(): string | null {
    const raw = this.details.lockout_until ?? this.details.lockoutUntil;
    return typeof raw === 'string' ? raw : null;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
