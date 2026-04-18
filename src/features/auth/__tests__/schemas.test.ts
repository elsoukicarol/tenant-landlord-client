import {
  acceptInvitationSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from '../schemas';

describe('auth schemas', () => {
  describe('loginSchema', () => {
    it('accepts a valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'omar@habitare.app',
        password: 'hunter2',
      });
      expect(result.success).toBe(true);
    });
    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'nope', password: 'x' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('auth.invalidEmail');
      }
    });
    it('rejects empty password', () => {
      const result = loginSchema.safeParse({ email: 'a@b.co', password: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('trims whitespace around email', () => {
      const result = forgotPasswordSchema.safeParse({ email: '  a@b.co  ' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.email).toBe('a@b.co');
    });
  });

  describe('resetPasswordSchema', () => {
    it('requires passwords to match', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'longenoughpw',
        confirmPassword: 'different',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const mismatch = result.error.issues.find((i) => i.path[0] === 'confirmPassword');
        expect(mismatch?.message).toBe('auth.passwordsDontMatch');
      }
    });
    it('requires minimum length', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'short',
        confirmPassword: 'short',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('acceptInvitationSchema', () => {
    it('requires a name with at least 2 characters', () => {
      const result = acceptInvitationSchema.safeParse({
        name: 'A',
        password: 'longenoughpw',
        confirmPassword: 'longenoughpw',
      });
      expect(result.success).toBe(false);
    });
  });
});
