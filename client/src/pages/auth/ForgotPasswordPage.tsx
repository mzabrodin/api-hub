import {useState} from 'react';
import {Link} from 'react-router-dom';
import {AuthLayout} from '../../components/ui/AuthLayout';
import {FormField} from '../../components/ui/FormField';
import {api} from '../../lib/api';
import * as React from "react";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', {email});
            setSent(true);
        } catch {

            setSent(true);
        } finally {
            setIsLoading(false);
        }
    }

    if (sent) {
        return (
            <AuthLayout
                title="Check your inbox"
                subtitle={`If an account exists for ${email}, you'll receive a reset link shortly.`}
            >
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
                        The link expires in 1 hour. Check your spam folder if you don't see it.
                    </p>

                    <Link
                        to="/login"
                        className="btn-primary w-full py-2.5 rounded-lg text-sm block"
                    >
                        Back to sign in
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="We'll send a reset link to your email address"
        >
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
                    error={error}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-2.5 rounded-lg text-sm mt-1"
                >
                    {isLoading ? 'Sending…' : 'Send reset link'}
                </button>

                <p className="text-center text-sm" style={{color: '#475569'}}>
                    Remembered it?{' '}
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
