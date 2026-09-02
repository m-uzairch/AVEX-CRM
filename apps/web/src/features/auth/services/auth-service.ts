import { createClient } from '@/lib/supabase/client';
import { RegisterFormValues, LoginFormValues } from '../schemas/auth-schemas';
import { AuthUserProfile, CompanyOnboarding } from '../types/auth-types';
import { env } from '@/config/env';

export class AuthService {
  private static supabase = createClient();

  private static isSupabaseLive(): boolean {
    const url = env.NEXT_PUBLIC_SUPABASE_URL || '';
    return !url.includes('your-supabase-project') && !url.includes('placeholder-project') && url.startsWith('http');
  }

  private static setSessionCookie(userId: string) {
    if (typeof document !== 'undefined') {
      document.cookie = `auth_session=${userId}; path=/; max-age=604800; SameSite=Lax`;
    }
  }

  private static clearSessionCookie() {
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax';
    }
  }

  static async registerUser(values: RegisterFormValues): Promise<{
    user: AuthUserProfile;
    company: CompanyOnboarding;
    isConfirmed: boolean;
  }> {
    let authDataUser: any = null;

    if (this.isSupabaseLive()) {
      try {
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
              company_name: values.companyName,
              business_type: values.businessType,
            },
          },
        });

        if (authError) {
          console.error('[AuthService.registerUser] Supabase error:', authError);
          // If network error, fallback to local workspace mode
          if (!authError.message.includes('fetch')) {
            throw new Error(authError.message);
          }
        } else {
          authDataUser = authData.user;
        }
      } catch (err: any) {
        if (!err.message?.includes('fetch')) {
          throw err;
        }
        console.warn('[AuthService.registerUser] Supabase endpoint unreachable, operating in local workspace mode.');
      }
    }

    // Call server-side /api/auth/register to securely hash and persist credentials
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        supabaseUserId: authDataUser?.id,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create workspace account.');
    }

    const data = await res.json();
    this.setSessionCookie(data.user.id);
    return data;
  }

  static async loginUser(values: LoginFormValues): Promise<AuthUserProfile> {
    let supabaseUser: any = null;

    if (this.isSupabaseLive()) {
      try {
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (authError) {
          console.error('[AuthService.loginUser] Supabase error:', authError);
          if (!authError.message.includes('fetch')) {
            throw new Error(authError.message);
          }
        } else if (authData.user) {
          supabaseUser = authData.user;
        }
      } catch (err: any) {
        if (!err.message?.includes('fetch')) {
          throw err;
        }
        console.warn('[AuthService.loginUser] Supabase endpoint unreachable, operating in local workspace mode.');
      }
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        supabaseUserId: supabaseUser?.id,
        supabaseUser,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid email or password.');
    }

    const data = await res.json();
    const user: AuthUserProfile = data.user;

    this.setSessionCookie(user.id);
    return user;
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    if (this.isSupabaseLive()) {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error('[AuthService.resendVerificationEmail] Supabase error:', error);
        throw new Error(error.message);
      }
    }
  }

  static async logoutUser(): Promise<void> {
    this.clearSessionCookie();
    if (this.isSupabaseLive()) {
      try {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
          console.error('[AuthService.logoutUser] Supabase error:', error);
        }
      } catch {
        // Ignore
      }
    }
  }

  static async requestPasswordReset(email: string): Promise<void> {
    if (this.isSupabaseLive()) {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        console.error('[AuthService.requestPasswordReset] Supabase error:', error);
        throw new Error(error.message);
      }
    }
  }

  static async resetPassword(newPassword: string): Promise<void> {
    if (this.isSupabaseLive()) {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        console.error('[AuthService.resetPassword] Supabase error:', error);
        throw new Error(error.message);
      }
    }
  }
}
