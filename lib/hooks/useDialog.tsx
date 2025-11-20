'use client';

import { useState, useCallback } from 'react';
import { DialogType } from '@/components/Dialog';

interface DialogState {
  isOpen: boolean;
  title?: string;
  message: string;
  type: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useDialog() {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const alert = useCallback((message: string, type: DialogType = 'info', title?: string) => {
    setDialogState({
      isOpen: true,
      message,
      type,
      title,
      confirmText: 'OK',
    });
  }, []);

  const confirm = useCallback(
    (
      message: string,
      onConfirm?: () => void,
      onCancel?: () => void,
      title?: string,
      confirmText = 'Xác nhận',
      cancelText = 'Hủy'
    ) => {
      setDialogState({
        isOpen: true,
        message,
        type: 'confirm',
        title,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const success = useCallback((message: string, title?: string) => {
    alert(message, 'success', title);
  }, [alert]);

  const error = useCallback((message: string, title?: string) => {
    alert(message, 'error', title);
  }, [alert]);

  const warning = useCallback((message: string, title?: string) => {
    alert(message, 'warning', title);
  }, [alert]);

  const info = useCallback((message: string, title?: string) => {
    alert(message, 'info', title);
  }, [alert]);

  return {
    dialogState,
    closeDialog,
    alert,
    confirm,
    success,
    error,
    warning,
    info,
  };
}
