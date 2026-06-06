"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccessRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/access-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      <button
        onClick={() => act("approve")}
        disabled={loading}
        className="text-sm text-green-700 dark:text-green-400 hover:underline disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => act("reject")}
        disabled={loading}
        className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
