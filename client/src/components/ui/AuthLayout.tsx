import type {ReactNode} from 'react';

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

export function AuthLayout({title, subtitle, children}: AuthLayoutProps) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundColor: '#03070f',
                backgroundImage: [
                    'radial-gradient(ellipse 900px 600px at 50% -60px, rgba(59,130,246,0.08) 0%, transparent 70%)',
                    'radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)',
                ].join(', '),
                backgroundSize: 'auto, 28px 28px',
            }}
        >
            <div
                className="w-full max-w-md"
                style={{animation: 'fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both'}}
            >
                {/* Brand */}
                <div className="flex items-center justify-center gap-2.5 mb-7">
                    <span
                        className="text-white text-base font-bold tracking-[0.18em] uppercase"
                        style={{fontFamily: 'Syne, sans-serif'}}
                    >API Hub</span>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl px-8 pt-7 pb-8 relative overflow-hidden"
                    style={{
                        background: '#080f22',
                        border: '1px solid rgba(255,255,255,0.065)',
                        boxShadow: '0 0 0 1px rgba(59,130,246,0.05), 0 40px 80px rgba(0,0,0,0.55)',
                    }}
                >
                    {/* Top glow accent */}
                    <div
                        className="absolute inset-x-0 top-0 h-px"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.55) 50%, transparent 100%)',
                        }}
                    />

                    {/* Heading */}
                    <div className="mb-6">
                        <h1
                            className="text-xl font-semibold text-white mb-1"
                            style={{fontFamily: 'Syne, sans-serif'}}
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm" style={{color: '#64748b'}}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
