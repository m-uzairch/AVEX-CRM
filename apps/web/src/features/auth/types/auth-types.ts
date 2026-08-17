import { UserRole } from '@/features/rbac/types/rbac-types';

export type BusinessType = 'DIGITAL' | 'PHYSICAL' | 'BOTH';

export interface CompanyOnboarding {
  id: string;
  name: string;
  businessType: BusinessType;
  createdAt: string;
}

export interface AuthUserProfile {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string;
  companyId: string;
  companyName: string;
  businessType: BusinessType;
  role: UserRole;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSessionState {
  user: AuthUserProfile | null;
  company: CompanyOnboarding | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
