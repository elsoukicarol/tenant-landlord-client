import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('auth.invalidEmail'),
  password: z.string().min(1, 'auth.passwordRequired'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('auth.invalidEmail'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'auth.passwordTooShort'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.passwordsDontMatch',
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const acceptInvitationSchema = z
  .object({
    name: z.string().trim().min(2, 'auth.nameTooShort'),
    password: z.string().min(8, 'auth.passwordTooShort'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'auth.passwordsDontMatch',
  });
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'auth.nameTooShort').optional(),
  language: z.enum(['es', 'en']).optional(),
  notificationPrefs: z
    .object({
      pushEnabled: z.boolean(),
      urgentOnly: z.boolean(),
      emailEnabled: z.boolean(),
    })
    .optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
