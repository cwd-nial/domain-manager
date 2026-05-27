"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string };

type DefaultValues = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  managerId?: string;
  roleIds?: string[];
  positionIds?: string[];
  teamIds?: string[];
};

type Props = {
  roles: Item[];
  positions: Item[];
  teams: Item[];
  employees: Item[];
  defaultValues?: DefaultValues;
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function EmployeeForm({
  roles,
  positions,
  teams,
  employees,
  defaultValues = {},
}: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues.id;

  const [name, setName] = useState(defaultValues.name ?? "");
  const [email, setEmail] = useState(defaultValues.email ?? "");
  const [phone, setPhone] = useState(defaultValues.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl ?? "");
  const [managerId, setManagerId] = useState(defaultValues.managerId ?? "");
  const [roleIds, setRoleIds] = useState<string[]>(
    defaultValues.roleIds ?? [],
  );
  const [positionIds, setPositionIds] = useState<string[]>(
    defaultValues.positionIds ?? [],
  );
  const [teamIds, setTeamIds] = useState<string[]>(
    defaultValues.teamIds ?? [],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle(
    list: string[],
    set: (l: string[]) => void,
    id: string,
  ) {
    set(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit
      ? `/api/employees/${defaultValues.id}`
      : "/api/employees";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: email || null,
        phone: phone || null,
        avatarUrl: avatarUrl || null,
        managerId: managerId || null,
        roleIds,
        positionIds,
        teamIds,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/employees/${isEdit ? defaultValues.id : data.id}`);
  }

  const managerOptions = employees.filter((e) => e.id !== defaultValues.id);

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
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Avatar URL</span>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Manager</span>
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className={inputCls}
          >
            <option value="">— none —</option>
            {managerOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <CheckboxGroup
        label="Roles"
        items={roles}
        selected={roleIds}
        toggle={(id) => toggle(roleIds, setRoleIds, id)}
      />
      <CheckboxGroup
        label="Positions"
        items={positions}
        selected={positionIds}
        toggle={(id) => toggle(positionIds, setPositionIds, id)}
      />
      <CheckboxGroup
        label="Teams"
        items={teams}
        selected={teamIds}
        toggle={(id) => toggle(teamIds, setTeamIds, id)}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Employee"}
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

function CheckboxGroup({
  label,
  items,
  selected,
  toggle,
}: {
  label: string;
  items: Item[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-gray-700 mb-2">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggle(item.id)}
              className="rounded"
            />
            {item.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
