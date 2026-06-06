"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteLookupButton({ apiUrl, label }: { apiUrl: string; label: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    const res = await fetch(apiUrl, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not delete");
      setConfirming(false);
      return;
    }
    router.refresh();
  }

  if (error) {
    return (
      <span className="text-xs text-red-600 dark:text-red-400">
        {error}{" "}
        <button onClick={() => setError(null)} className="underline">
          ok
        </button>
      </span>
    );
  }

  if (confirming) {
    return (
      <span className="text-xs text-gray-700 dark:text-gray-300">
        Delete &ldquo;{label}&rdquo;?{" "}
        <button onClick={handleDelete} className="text-red-600 dark:text-red-400 underline mr-1">
          Yes
        </button>
        <button onClick={() => setConfirming(false)} className="underline">
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 dark:text-red-400 hover:underline"
    >
      Delete
    </button>
  );
}
