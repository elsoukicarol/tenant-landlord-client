import { ApiError, isApiError } from '../errors';

describe('ApiError', () => {
  it('classifies common status codes', () => {
    expect(new ApiError(401, 'Unauthorized').isUnauthorized).toBe(true);
    expect(new ApiError(403, 'Forbidden').isForbidden).toBe(true);
    expect(new ApiError(404, 'Not found').isNotFound).toBe(true);
    expect(new ApiError(409, 'Conflict').isConflict).toBe(true);
    expect(new ApiError(423, 'Locked').isLocked).toBe(true);
    expect(new ApiError(400, 'Bad').isValidation).toBe(true);
  });

  it('exposes lockout_until from details on 423', () => {
    const err = new ApiError(423, 'Locked', [], {
      lockout_until: '2026-04-18T15:30:00.000Z',
    });
    expect(err.lockoutUntil).toBe('2026-04-18T15:30:00.000Z');
  });

  it('returns null lockoutUntil when absent', () => {
    expect(new ApiError(401, 'Unauthorized').lockoutUntil).toBeNull();
  });

  it('narrows via isApiError', () => {
    expect(isApiError(new ApiError(500, 'boom'))).toBe(true);
    expect(isApiError(new Error('not api'))).toBe(false);
  });
});
