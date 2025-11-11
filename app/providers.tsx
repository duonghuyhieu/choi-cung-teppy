'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { HelpDialogProvider } from '@/lib/contexts/HelpDialogContext';
import HelpDialogContent from '@/components/HelpDialogContent';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each request
  // This ensures that data is not shared between different users and requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HelpDialogProvider>
        {children}
        <HelpDialogPortal />
      </HelpDialogProvider>
    </QueryClientProvider>
  );
}

// Portal component to render dialog at root level
function HelpDialogPortal() {
  // This will be rendered outside the normal component tree
  return <HelpDialogContent />;
}
