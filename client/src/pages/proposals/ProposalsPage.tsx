import {useState, useEffect} from 'react';
import {Link, useSearchParams, Navigate} from 'react-router-dom';
import {AppLayout} from '../../components/ui/AppLayout';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import {useAuth} from '../../hooks/useAuth';
import type {Proposal, PaginatedResponse, ProposalStatus} from '../../types/api';

const STATUS_LABEL: Record<ProposalStatus, string> = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
};

const STATUS_CLASS: Record<ProposalStatus, string> = {
    PENDING: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    ACCEPTED: 'bg-green-400/10 text-green-400 border border-green-400/20',
    REJECTED: 'bg-red-400/10 text-red-400 border border-red-400/20',
};

function StatusBadge({status}: { status: ProposalStatus }) {
    return (
        <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-md ${STATUS_CLASS[status]}`}>
            {STATUS_LABEL[status]}
        </span>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5">
            <div className="flex-1 space-y-2">
                <div className="skeleton" style={{height: 14, width: '40%'}}/>
                <div className="skeleton" style={{height: 12, width: '25%'}}/>
            </div>
            <div className="skeleton rounded-md" style={{height: 22, width: 64}}/>
        </div>
    );
}

export function ProposalsPage() {
    const {user} = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    if (user?.role === 'ADMIN') return <Navigate to="/catalog" replace/>;
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [pagination, setPagination] = useState<{ page: number; totalPages: number; total: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const status = searchParams.get('status') ?? '';
    const currentPage = Number(searchParams.get('page') ?? '1');

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError('');

        const params: Record<string, string> = {};
        searchParams.forEach((v, k) => {
            params[k] = v;
        });

        api.get<PaginatedResponse<Proposal>>('/proposals', {params})
            .then(res => {
                if (cancelled) return;
                setProposals(res.data.data);
                setPagination(res.data.pagination);
            })
            .catch(err => {
                if (!cancelled) setError(parseApiError(err));
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    function setFilter(key: string, value: string) {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            value ? next.set(key, value) : next.delete(key);
            next.delete('page');
            return next;
        }, {replace: true});
    }

    function setPage(page: number) {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(page));
            return next;
        }, {replace: true});
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this proposal?')) return;
        setDeleting(id);
        try {
            await api.delete(`/proposals/${id}`);
            setProposals(prev => prev.filter(p => p.id !== id));
            if (pagination) setPagination(prev => prev ? {...prev, total: prev.total - 1} : prev);
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setDeleting(null);
        }
    }

    const selectCls = 'dark-select pl-3 py-1.5 rounded-lg text-sm';

    return (
        <AppLayout>
            <div
                className="min-h-screen"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-9 pb-16">

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="font-display text-[22px] font-bold text-white mb-1">My Proposals</h1>
                            <p className="text-sm text-slate-500">
                                {isLoading ? 'Loading…' : pagination ? `${pagination.total} proposal${pagination.total !== 1 ? 's' : ''}` : ''}
                            </p>
                        </div>
                        <Link to="/proposals/new" className="btn-primary text-sm rounded-lg px-4 py-2 no-underline">
                            + New proposal
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <select className={selectCls} value={status}
                                onChange={e => setFilter('status', e.target.value)}>
                            <option value="">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {error && (
                        <div
                            className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <div className="rounded-xl border border-white/6.5 bg-[#080f22] overflow-hidden">
                        {isLoading
                            ? Array.from({length: 5}).map((_, i) => <SkeletonRow key={i}/>)
                            : proposals.length === 0
                                ? (
                                    <div className="flex flex-col items-center py-16 text-center">
                                        <p className="text-sm font-medium text-white mb-1">No proposals yet</p>
                                        <p className="text-sm text-slate-600 mb-4">Submit your first API proposal</p>
                                        <Link to="/proposals/new"
                                              className="btn-primary text-sm rounded-lg px-4 py-2 no-underline">
                                            + New proposal
                                        </Link>
                                    </div>
                                )
                                : proposals.map((p, i) => (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-4 px-5 py-4 ${i < proposals.length - 1 ? 'border-b border-white/5' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{p.name}</p>
                                            <p className="text-xs text-slate-600 mt-0.5">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                                {p.adminNote &&
                                                    <span className="ml-2 text-slate-500 italic">"{p.adminNote}"</span>}
                                            </p>
                                        </div>
                                        <StatusBadge status={p.status}/>
                                        {p.status === 'PENDING' && (
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Link
                                                    to={`/proposals/${p.id}/edit`}
                                                    className="text-xs text-slate-500 bg-white/4 border border-white/8 rounded-md px-2.5 py-1 hover:text-white transition-colors no-underline"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    disabled={deleting === p.id}
                                                    className="text-xs text-slate-500 bg-white/4 border border-white/8 rounded-md px-2.5 py-1 cursor-pointer hover:text-red-400 hover:border-red-400/20 transition-colors disabled:opacity-40"
                                                >
                                                    {deleting === p.id ? '…' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                        }
                    </div>

                    {!isLoading && pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-8">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => setPage(currentPage - 1)}
                                className="text-sm text-slate-400 bg-white/4 border border-white/8 rounded-lg px-4 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-white transition-colors"
                            >
                                ← Previous
                            </button>
                            <span
                                className="text-sm text-slate-500">Page {currentPage} of {pagination.totalPages}</span>
                            <button
                                disabled={currentPage >= pagination.totalPages}
                                onClick={() => setPage(currentPage + 1)}
                                className="text-sm text-slate-400 bg-white/4 border border-white/8 rounded-lg px-4 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-white transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
