import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { AuthUserProfile, CompanyOnboarding } from '../types/auth-types';

export interface AuthState {
  user: AuthUserProfile | null;
  company: CompanyOnboarding | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUserProfile, company: CompanyOnboarding) => void;
  updateUser: (userPartial: Partial<AuthUserProfile>) => void;
  logout: () => void;
}

const nopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, company) =>
        set({
          user,
          company,
          isAuthenticated: true,
          isLoading: false,
        }),

      updateUser: (userPartial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userPartial } : null,
        })),

      logout: () =>
        set({
          user: null,
          company: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'avex-auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : nopStorage)),
    }
  )
);
