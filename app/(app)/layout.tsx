import { NavShell } from "@/components/NavShell";
import { getIsAdmin } from "@/lib/session";

import { Providers } from "./Providers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const isAdmin = await getIsAdmin();
    return (
        <Providers>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
                <NavShell isAdmin={isAdmin} />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
            </div>
        </Providers>
    );
}
