import { create } from 'zustand';

interface OnboardingTourStore {
  isOpen: boolean;
  currentStep: number;
  openTour: () => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeTour: () => void;
}

const TOTAL_STEPS = 8;
const STORAGE_KEY = 'avex_crm_onboarding_tour_completed';

export const useOnboardingTour = create<OnboardingTourStore>((set, get) => ({
  isOpen: false,
  currentStep: 0,

  openTour: () => {
    set({ isOpen: true, currentStep: 0 });
  },

  closeTour: () => {
    set({ isOpen: false });
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < TOTAL_STEPS - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      get().completeTour();
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  goToStep: (step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      set({ currentStep: step });
    }
  },

  completeTour: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Safe catch for local storage
      }
    }
    set({ isOpen: false, currentStep: 0 });
  },
}));

export function shouldAutoOpenTour(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const completed = localStorage.getItem(STORAGE_KEY);
    return completed !== 'true';
  } catch {
    return false;
  }
}
