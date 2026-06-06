'use client';

import { NameFormatProvider } from '@/lib/nameFormatContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return <NameFormatProvider>{children}</NameFormatProvider>;
}
