"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RequestAdminButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRequest() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/access-requests", { method: "POST" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error ?? "Something went wrong");
                return;
            }
            router.refresh();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}
            <button
                onClick={handleRequest}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 dark:bg-teal-600 text-white hover:bg-blue-700 dark:hover:bg-teal-700 disabled:opacity-50"
            >
                {loading ? "Submitting…" : "Request Admin Access"}
            </button>
        </div>
    );
}
