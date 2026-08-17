'use client';

import * as React from 'react';
import { Toast, ToastMessage, ToastType } from '@/components/ui/toast';

interface ToastContextValue {
  toast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = React.useCallback(
    (title: string, message?: string, type: ToastType = 'info') => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      const newToast: ToastMessage = { id, title, message, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 7000);
    },
    []
  );

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({
      toast: addToast,
      success: (title: string, message?: string) => addToast(title, message, 'success'),
      error: (title: string, message?: string) => addToast(title, message, 'error'),
      warning: (title: string, message?: string) => addToast(title, message, 'warning'),
      info: (title: string, message?: string) => addToast(title, message, 'info'),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-auto">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
