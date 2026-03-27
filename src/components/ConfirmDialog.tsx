'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext).confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext value={{ confirm }}>
      {children}
      {state && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[300]" onClick={() => handleClose(false)} />
          <div className="fixed inset-0 z-[301] flex items-center justify-center p-4">
            <div className="bg-[var(--surface-card)] rounded-2xl shadow-sm shadow-black/4 p-6 w-full max-w-sm shadow-2xl animate-fade-up">
              {state.options.title && (
                <h3 className="text-base font-bold text-[var(--text)] mb-2">{state.options.title}</h3>
              )}
              <p className="text-sm text-[var(--text-sub)] mb-6 whitespace-pre-line">{state.options.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-2.5 bg-[var(--border)] text-[var(--text-sub)] rounded-2xl text-sm font-bold hover:opacity-80 transition-opacity btn-press"
                >
                  {state.options.cancelText || '취소'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 py-2.5 text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity btn-press ${
                    state.options.danger ? 'bg-danger' : 'bg-primary'
                  }`}
                >
                  {state.options.confirmText || '확인'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </ConfirmContext>
  );
}
