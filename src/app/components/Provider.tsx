'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## 3. **Estrutura de Páginas (App Router)**
```
app/
├── layout.tsx (arquivo acima)
├── page.tsx (Catalog)
├── auth/
│   └── page.tsx
├── cart/
│   └── page.tsx
├── checkout/
│   └── page.tsx
├── order/
│   └── [id]/
│       └── page.tsx
└── not-found.tsx