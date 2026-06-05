import { NavShell } from "@/components/NavShell";

import { Providers } from "./Providers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
                <NavShell />
                <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">{children}</main>
            </div>
        </Providers>
    );
}
