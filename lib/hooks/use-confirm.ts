'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface ConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextValue {
  state: ConfirmDialogState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
  handleOpenChange: (open: boolean) => void;
}

const initialState: ConfirmDialogState = {
  open: false,
  title: '',
  description: undefined,
  confirmLabel: undefined,
  cancelLabel: undefined,
  variant: 'default',
  resolve: null,
};

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirmController(): ConfirmContextValue {
  const [state, setState] = useState<ConfirmDialogState>(initialState);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const finalize = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setState((current) => ({ ...current, open: false, resolve: null }));
  }, []);

  const handleConfirm = useCallback(() => finalize(true), [finalize]);
  const handleCancel = useCallback(() => finalize(false), [finalize]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) finalize(false);
    },
    [finalize]
  );

  return useMemo(
    () => ({ state, confirm, handleConfirm, handleCancel, handleOpenChange }),
    [state, confirm, handleConfirm, handleCancel, handleOpenChange]
  );
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.confirm;
}
