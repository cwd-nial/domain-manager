'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/FormField';

type Props = {
    defaultName?: string;
    apiUrl: string;
    method: 'POST' | 'PUT';
    redirectTo: string;
    label: string;
};

export function LookupForm({ defaultName = '', apiUrl, method, redirectTo, label }: Props) {
    const router = useRouter();
    const [name, setName] = useState(defaultName);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            const res = await fetch(apiUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error ?? 'Something went wrong');
                return;
            }
            router.push(redirectTo);
            router.refresh();
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
            <InputField
                label={label}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
