import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {AuthLayout} from '../../components/ui/AuthLayout';
import {FormField} from '../../components/ui/FormField';
import {useAuth} from '../../hooks/useAuth';
import {parseApiError} from '../../lib/parseApiError';
import * as React from "react";

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/catalog', {replace: true});
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to continue to API Hub">
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

                <div className="flex flex-col gap-1.5">
                    <FormField
                        label="Password"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                    />
                    <div className="flex justify-end mt-0.5">
                        <Link
                            to="/forgot-password"
                            className="text-xs transition-colors"
                            style={{color: '#3b82f6'}}
                            onMouseOver={(e) => (e.currentTarget.style.color = '#60a5fa')}
                            onMouseOut={(e) => (e.currentTarget.style.color = '#3b82f6')}
                        >
                            Forgot password?
                        </Link>
                    </div>
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
                    {isLoading ? 'Signing in…' : 'Sign in'}
                </button>

                <p className="text-center text-sm" style={{color: '#475569'}}>
                    No account?{' '}
                    <Link
                        to="/register"
                        className="font-medium transition-colors"
                        style={{color: '#3b82f6'}}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#60a5fa')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#3b82f6')}
                    >
                        Create one
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
