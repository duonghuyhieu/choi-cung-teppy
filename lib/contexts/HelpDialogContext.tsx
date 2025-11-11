'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HelpDialogContextType {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

const HelpDialogContext = createContext<HelpDialogContextType | undefined>(undefined);

export function HelpDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return (
    <HelpDialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
      {children}
    </HelpDialogContext.Provider>
  );
}

export function useHelpDialog() {
  const context = useContext(HelpDialogContext);
  if (context === undefined) {
    throw new Error('useHelpDialog must be used within a HelpDialogProvider');
  }
  return context;
}
