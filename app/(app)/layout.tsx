import { NavShell } from '@/components/NavShell';
import { getIsAdmin } from '@/lib/session';

import { Providers } from './Providers';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const isAdmin = await getIsAdmin();
    return (
        <Providers>
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
                <NavShell isAdmin={isAdmin} />
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
            </div>
        </Providers>
    );
}
