import {useEffect, useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {AuthLayout} from '../../components/ui/AuthLayout';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<Status>('loading');
    const [message, setMessage] = useState('');
    const didCall = useRef(false);

    useEffect(() => {
        if (didCall.current) return;
        didCall.current = true;

        if (!token) {
            setStatus('error');
            setMessage('No verification token found. Please check your email link.');
            return;
        }

        api
            .post('/auth/verify-email', {token})
            .then(() => setStatus('success'))
            .catch((err) => {
                const msg = parseApiError(err);
                if (msg.toLowerCase().includes('already verified')) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(msg);
                }
            });
    }, [token]);

    return (
        <AuthLayout
            title={
                status === 'loading'
                    ? 'Verifying your email…'
                    : status === 'success'
                        ? 'Email verified'
                        : 'Verification failed'
            }
            subtitle={
                status === 'loading' ? 'This will only take a moment.' : undefined
            }
        >
            <div className="flex flex-col items-center gap-5 py-2 text-center">
                {status === 'loading' && (
                    <div
                        className="w-10 h-10 rounded-full border-2"
                        style={{
                            borderColor: 'rgba(59,130,246,0.2)',
                            borderTopColor: '#3b82f6',
                            animation: 'spin 0.8s linear infinite',
                        }}
                    />
                )}

                {status === 'success' && (
                    <>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(74,222,128,0.1)',
                                border: '1px solid rgba(74,222,128,0.22)',
                                animation: 'fade-in 0.3s ease both',
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                    d="M5 13l4 4L19 7"
                                    stroke="#4ade80"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <p className="text-sm leading-relaxed" style={{color: '#64748b'}}>
                            Your email has been confirmed. You can now sign in to your account.
                        </p>
                        <Link
                            to="/login"
                            className="btn-primary w-full py-2.5 rounded-lg text-sm block"
                        >
                            Sign in
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.22)',
                                animation: 'fade-in 0.3s ease both',
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
                        <p className="text-sm leading-relaxed" style={{color: '#64748b'}}>
                            {message || 'Something went wrong. Please try again.'}
                        </p>
                        <Link
                            to="/register"
                            className="btn-primary w-full py-2.5 rounded-lg text-sm block"
                        >
                            Back to register
                        </Link>
                    </>
                )}
            </div>
        </AuthLayout>
    );
}
