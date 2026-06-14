'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { InputField, SelectField } from '@/components/ui/FormField';

type Item = { id: string; name: string };

type DefaultValues = {
    id?: string;
    firstName?: string;
    lastName?: string;
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

export function EmployeeForm({ roles, positions, teams, employees, defaultValues = {} }: Props) {
    const router = useRouter();
    const isEdit = !!defaultValues.id;

    const [firstName, setFirstName] = useState(defaultValues.firstName ?? '');
    const [lastName, setLastName] = useState(defaultValues.lastName ?? '');
    const [email, setEmail] = useState(defaultValues.email ?? '');
    const [phone, setPhone] = useState(defaultValues.phone ?? '');
    const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl ?? '');
    const [managerId, setManagerId] = useState(defaultValues.managerId ?? '');
    const [roleIds, setRoleIds] = useState<string[]>(defaultValues.roleIds ?? []);
    const [positionIds, setPositionIds] = useState<string[]>(defaultValues.positionIds ?? []);
    const [teamIds, setTeamIds] = useState<string[]>(defaultValues.teamIds ?? []);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function toggle(list: string[], set: (l: string[]) => void, id: string) {
        set(list.includes(id) ? list.filter((i) => i !== id) : [...list, id]);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const url = isEdit ? `/api/employees/${defaultValues.id}` : '/api/employees';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName,
                lastName,
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
            setError(data.error ?? 'Something went wrong');
            setLoading(false);
            return;
        }

        const data = await res.json();
        router.push(`/employees/${isEdit ? defaultValues.id : data.id}`);
    }

    const managerOptions = employees.filter((e) => e.id !== defaultValues.id);

    return (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
            {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <InputField
                        label="First Name *"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    <InputField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <InputField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <InputField label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
                <SelectField label="Manager" value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                    <option value="">— none —</option>
                    {managerOptions.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.name}
                        </option>
                    ))}
                </SelectField>
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
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Employee'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                    Cancel
                </Button>
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
            <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</legend>
            <div className="flex flex-wrap gap-3">
                {items.map((item) => (
                    <label
                        key={item.id}
                        className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300"
                    >
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
