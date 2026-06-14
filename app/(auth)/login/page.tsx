'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/FormField';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    function switchMode(next: 'signin' | 'signup') {
        setMode(next);
        setError(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setPending(true);
        setError(null);

        const { error } =
            mode === 'signin'
                ? await authClient.signIn.email({ email, password })
                : await authClient.signUp.email({ email, password, name: email.split('@')[0] });

        if (error) {
            setError(error.message ?? (mode === 'signin' ? 'Invalid credentials' : 'Sign-up failed'));
            setPending(false);
        } else {
            router.push(mode === 'signup' ? '/pending-approval' : '/');
        }
    }

    const isSignUp = mode === 'signup';

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-semibold">{isSignUp ? 'Create account' : 'Sign in'}</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <InputField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <InputField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    />
                    {isSignUp && (
                        <InputField
                            label="Confirm password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" disabled={pending} className="mt-2 transition-colors">
                        {pending
                            ? isSignUp
                                ? 'Creating account…'
                                : 'Signing in…'
                            : isSignUp
                              ? 'Create account'
                              : 'Sign in'}
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-500">
                    {isSignUp ? (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => switchMode('signin')} className="link-primary">
                                Sign in
                            </button>
                        </>
                    ) : (
                        <>
                            Don&apos;t have an account?{' '}
                            <button onClick={() => switchMode('signup')} className="link-primary">
                                Sign up
                            </button>
                        </>
                    )}
                </p>
            </div>
        </main>
    );
}
