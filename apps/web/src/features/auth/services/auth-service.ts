import { createClient } from '@/lib/supabase/client';
import { RegisterFormValues, LoginFormValues } from '../schemas/auth-schemas';
import { AuthUserProfile, CompanyOnboarding } from '../types/auth-types';

export class AuthService {
  private static supabase = createClient();

  static async registerUser(values: RegisterFormValues): Promise<{
    user: AuthUserProfile;
    company: CompanyOnboarding;
    isConfirmed: boolean;
  }> {
    // Attempt Supabase Auth Sign Up
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
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Registration failed: No user returned from authentication server.');
    }

    const isConfirmed = Boolean(authData.session || authData.user.email_confirmed_at);
    const companyId = `comp_${authData.user.id.substring(0, 8)}`;

    const company: CompanyOnboarding = {
      id: companyId,
      name: values.companyName,
      businessType: values.businessType,
      createdAt: new Date().toISOString(),
    };

    const user: AuthUserProfile = {
      id: authData.user.id,
      supabaseUserId: authData.user.id,
      email: values.email,
      fullName: values.fullName,
      companyId: company.id,
      companyName: company.name,
      businessType: company.businessType,
      role: 'COMPANY_OWNER',
      isEmailVerified: isConfirmed,
      createdAt: new Date().toISOString(),
    };

    // Safe DB profile creation check (does not break auth if DB sync fails)
    try {
      // If DB profile sync endpoint exists, invoke here
    } catch (dbError) {
      console.warn('[AuthService.registerUser] Non-critical profile sync warning:', dbError);
    }

    return { user, company, isConfirmed };
  }

  static async loginUser(values: LoginFormValues): Promise<AuthUserProfile> {
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (authError) {
      console.error('[AuthService.loginUser] Supabase error:', authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Login failed: Invalid credentials or session not established.');
    }

    const user = authData.user;
    const fullName = user.user_metadata?.full_name || values.email.split('@')[0];
    const companyName = user.user_metadata?.company_name || 'My Workspace';
    const businessType = user.user_metadata?.business_type || 'DIGITAL';
    const companyId = `comp_${user.id.substring(0, 8)}`;

    return {
      id: user.id,
      supabaseUserId: user.id,
      email: user.email || values.email,
      fullName,
      companyId,
      companyName,
      businessType,
      role: 'COMPANY_OWNER',
      isEmailVerified: Boolean(user.email_confirmed_at),
      createdAt: user.created_at || new Date().toISOString(),
    };
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('[AuthService.resendVerificationEmail] Supabase error:', error);
      throw new Error(error.message);
    }
  }

  static async logoutUser(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('[AuthService.logoutUser] Supabase error:', error);
    }
  }

  static async requestPasswordReset(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      console.error('[AuthService.requestPasswordReset] Supabase error:', error);
      throw new Error(error.message);
    }
  }

  static async resetPassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      console.error('[AuthService.resetPassword] Supabase error:', error);
      throw new Error(error.message);
    }
  }
}
