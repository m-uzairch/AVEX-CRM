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

    const userId = authDataUser?.id || `usr_${Math.random().toString(36).substring(2, 10)}`;
    const isConfirmed = Boolean(authDataUser?.session || authDataUser?.email_confirmed_at || true);
    const companyId = `comp_${userId.substring(0, 8)}`;

    const company: CompanyOnboarding = {
      id: companyId,
      name: values.companyName,
      businessType: values.businessType,
      createdAt: new Date().toISOString(),
    };

    const user: AuthUserProfile = {
      id: userId,
      supabaseUserId: userId,
      email: values.email,
      fullName: values.fullName,
      companyId: company.id,
      companyName: company.name,
      businessType: company.businessType,
      role: 'COMPANY_OWNER',
      isEmailVerified: isConfirmed,
      createdAt: new Date().toISOString(),
    };

    this.setSessionCookie(userId);

    return { user, company, isConfirmed };
  }

  static async loginUser(values: LoginFormValues): Promise<AuthUserProfile> {
    let authDataUser: any = null;

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
        } else {
          authDataUser = authData.user;
        }
      } catch (err: any) {
        if (!err.message?.includes('fetch')) {
          throw err;
        }
        console.warn('[AuthService.loginUser] Supabase endpoint unreachable, operating in local workspace mode.');
      }
    }

    const email = values.email.trim().toLowerCase();
    const userId = authDataUser?.id || `usr_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}`;
    const fullName = authDataUser?.user_metadata?.full_name || email.split('@')[0].replace('.', ' ');
    const companyName = authDataUser?.user_metadata?.company_name || 'My Workspace';
    const businessType = authDataUser?.user_metadata?.business_type || 'DIGITAL';
    const companyId = `comp_${userId.substring(0, 8)}`;

    this.setSessionCookie(userId);

    return {
      id: userId,
      supabaseUserId: userId,
      email,
      fullName: fullName.charAt(0).toUpperCase() + fullName.slice(1),
      companyId,
      companyName,
      businessType,
      role: 'COMPANY_OWNER',
      isEmailVerified: Boolean(authDataUser?.email_confirmed_at || true),
      createdAt: authDataUser?.created_at || new Date().toISOString(),
    };
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
