"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Team = { id: string; name: string };

type DefaultValues = {
  id?: string;
  name?: string;
  description?: string;
  parentId?: string;
};

type Props = {
  teams: Team[];
  defaultValues?: DefaultValues;
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function TeamForm({ teams, defaultValues = {} }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues.id;

  const [name, setName] = useState(defaultValues.name ?? "");
  const [description, setDescription] = useState(
    defaultValues.description ?? "",
  );
  const [parentId, setParentId] = useState(defaultValues.parentId ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/teams/${defaultValues.id}` : "/api/teams";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || null,
        parentId: parentId || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/teams/${isEdit ? defaultValues.id : data.id}`);
  }

  const parentOptions = teams.filter((t) => t.id !== defaultValues.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Name *</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Parent Team</span>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className={inputCls}
          >
            <option value="">— none —</option>
            {parentOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Team"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
