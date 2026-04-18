import {useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {AuthLayout} from '../../components/ui/AuthLayout';
import {FormField} from '../../components/ui/FormField';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import * as React from "react";

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    if (!token) {
        return (
            <AuthLayout title="Invalid link" subtitle="This password reset link is missing a token.">
                <div className="flex flex-col items-center gap-5 py-2 text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.22)',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="#f87171"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <p className="text-sm" style={{color: '#64748b'}}>
                        Please request a new password reset link.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="btn-primary w-full py-2.5 rounded-lg text-sm block"
                    >
                        Request new link
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', {token, password});
            navigate('/login', {replace: true, state: {resetSuccess: true}});
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout title="Set new password" subtitle="Choose a strong password for your account">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <FormField
                        label="New password"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                        error={error}
                    />
                    <p className="text-xs" style={{color: '#475569'}}>
                        Min 8 chars, must include uppercase, lowercase, digit &amp; special character.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-2.5 rounded-lg text-sm mt-1"
                >
                    {isLoading ? 'Saving…' : 'Set new password'}
                </button>

                <p className="text-center text-sm" style={{color: '#475569'}}>
                    <Link
                        to="/login"
                        className="font-medium transition-colors"
                        style={{color: '#3b82f6'}}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#60a5fa')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#3b82f6')}
                    >
                        Back to sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
