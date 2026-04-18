type BadgeVariant = 'green' | 'red' | 'amber' | 'violet' | 'gray' | 'blue' | 'slate';

const CLASSES: Record<BadgeVariant, string> = {
    green: 'bg-green-400/10 text-green-400 border border-green-400/20',
    red: 'bg-red-400/10 text-red-400 border border-red-400/20',
    amber: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    violet: 'bg-violet-400/10 text-violet-400 border border-violet-400/20',
    gray: 'bg-slate-400/10 text-slate-400 border border-slate-400/15',
    blue: 'bg-blue-400/10 text-blue-400 border border-blue-400/20',
    slate: 'bg-white/[0.04] text-slate-500 border border-white/[0.08]',
};

export function Badge({label, variant}: { label: string; variant: BadgeVariant }) {
    return (
        <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-md ${CLASSES[variant]}`}>
            {label}
        </span>
    );
}

export function authTypeBadge(authType: string) {
    if (authType === 'API_KEY') return <Badge label="API Key" variant="amber"/>;
    if (authType === 'OAUTH') return <Badge label="OAuth" variant="violet"/>;
    return <Badge label="No Auth" variant="gray"/>;
}

export function corsBadge(corsStatus: string) {
    if (corsStatus === 'AVAILABLE') return <Badge label="CORS" variant="green"/>;
    if (corsStatus === 'UNAVAILABLE') return <Badge label="No CORS" variant="red"/>;
    return <Badge label="CORS?" variant="amber"/>;
}
