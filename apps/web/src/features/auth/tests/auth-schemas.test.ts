import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, resetPasswordSchema } from '../schemas/auth-schemas';

describe('Auth Validation Schemas Suite', () => {
  describe('registerSchema', () => {
    it('validates a valid registration payload', () => {
      const validData = {
        fullName: 'Alex Carter',
        email: 'alex@acme.com',
        companyName: 'Acme Corp',
        businessType: 'DIGITAL',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        agreeTerms: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects passwords that do not match confirmPassword', () => {
      const invalidData = {
        fullName: 'Alex Carter',
        email: 'alex@acme.com',
        companyName: 'Acme Corp',
        businessType: 'DIGITAL',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        agreeTerms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects weak passwords shorter than 8 characters', () => {
      const invalidData = {
        fullName: 'Alex Carter',
        email: 'alex@acme.com',
        companyName: 'Acme Corp',
        businessType: 'DIGITAL',
        password: 'short',
        confirmPassword: 'short',
        agreeTerms: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates correct email and password fields', () => {
      const validData = {
        email: 'user@company.com',
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123!',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates matching passwords', () => {
      const validData = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
