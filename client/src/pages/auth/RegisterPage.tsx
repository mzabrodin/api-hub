import {useState} from 'react';
import {Link} from 'react-router-dom';
import {AuthLayout} from '../../components/ui/AuthLayout';
import {FormField} from '../../components/ui/FormField';
import {useAuth} from '../../hooks/useAuth';
import {parseApiError} from '../../lib/parseApiError';
import * as React from "react";

export function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const {register} = useAuth();

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await register(email, password, username);
            setRegistered(true);
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setIsLoading(false);
        }
    }

    if (registered) {
        return (
            <AuthLayout title="Check your inbox" subtitle={`We sent a verification link to ${email}`}>
                <div className="flex flex-col items-center gap-5 py-2 text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(74,222,128,0.1)',
                            border: '1px solid rgba(74,222,128,0.22)',
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                                d="M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                stroke="#4ade80"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />
                            <path d="M4 4l8 9 8-9" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <p className="text-sm leading-relaxed" style={{color: '#64748b'}}>
                        Click the link in the email to verify your account, then come back to sign in.
                    </p>

                    <Link
                        to="/login"
                        className="btn-primary w-full py-2.5 rounded-lg text-sm text-center block"
                    >
                        Go to sign in
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Create account" subtitle="Join API Hub to explore and manage APIs">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <FormField
                    label="Email"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                />

                <FormField
                    label="Username"
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                />

                <div className="flex flex-col gap-1.5">
                    <FormField
                        label="Password"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                    />
                    <p className="text-xs" style={{color: '#475569'}}>
                        Min 8 chars, must include uppercase, lowercase, digit &amp; special character.
                    </p>
                </div>

                {error && (
                    <div
                        className="text-sm rounded-lg px-4 py-3"
                        style={{
                            color: '#f87171',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-2.5 rounded-lg text-sm mt-1"
                >
                    {isLoading ? 'Creating account…' : 'Create account'}
                </button>

                <p className="text-center text-sm" style={{color: '#475569'}}>
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium transition-colors"
                        style={{color: '#3b82f6'}}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#60a5fa')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#3b82f6')}
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
