'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { InputField, SelectField, TextareaField } from '@/components/ui/FormField';

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

export function TeamForm({ teams, defaultValues = {} }: Props) {
    const router = useRouter();
    const isEdit = !!defaultValues.id;

    const [name, setName] = useState(defaultValues.name ?? '');
    const [description, setDescription] = useState(defaultValues.description ?? '');
    const [parentId, setParentId] = useState(defaultValues.parentId ?? '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const url = isEdit ? `/api/teams/${defaultValues.id}` : '/api/teams';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description: description || null,
                parentId: parentId || null,
            }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error ?? 'Something went wrong');
            setLoading(false);
            return;
        }

        const data = await res.json();
        router.push(`/teams/${isEdit ? defaultValues.id : data.id}`);
    }

    const parentOptions = teams.filter((t) => t.id !== defaultValues.id);

    return (
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
            {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="space-y-4">
                <InputField label="Name *" value={name} onChange={(e) => setName(e.target.value)} required />
                <TextareaField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />
                <SelectField label="Parent Team" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                    <option value="">— none —</option>
                    {parentOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </SelectField>
            </div>

            <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Team'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
