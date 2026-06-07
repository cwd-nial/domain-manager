'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';

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
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:focus:ring-teal-500"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:focus:ring-teal-500"
                        />
                    </div>
                    {isSignUp && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:focus:ring-teal-500"
                            />
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={pending}
                        className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-700"
                    >
                        {pending
                            ? isSignUp
                                ? 'Creating account…'
                                : 'Signing in…'
                            : isSignUp
                              ? 'Create account'
                              : 'Sign in'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-500">
                    {isSignUp ? (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={() => switchMode('signin')}
                                className="text-blue-600 hover:underline dark:text-teal-400"
                            >
                                Sign in
                            </button>
                        </>
                    ) : (
                        <>
                            Don&apos;t have an account?{' '}
                            <button
                                onClick={() => switchMode('signup')}
                                className="text-blue-600 hover:underline dark:text-teal-400"
                            >
                                Sign up
                            </button>
                        </>
                    )}
                </p>
            </div>
        </main>
    );
}
