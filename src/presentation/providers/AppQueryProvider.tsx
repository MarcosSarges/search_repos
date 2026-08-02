import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { createQueryClient } from './create-query-client';

type AppQueryProviderProps = {
  children: ReactNode;
  client?: QueryClient;
};

export function AppQueryProvider({ children, client }: AppQueryProviderProps) {
  const [defaultClient] = useState(createQueryClient);
  return <QueryClientProvider client={client ?? defaultClient}>{children}</QueryClientProvider>;
}
