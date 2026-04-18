import {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {AppLayout} from '../../components/ui/AppLayout';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import type {Proposal, ProposalStatus, PaginatedResponse, ApiResponse} from '../../types/api';
import * as React from "react";

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

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5">
            <div className="flex-1 space-y-1.5">
                <div className="skeleton" style={{height: 13, width: '40%'}}/>
                <div className="skeleton" style={{height: 11, width: '30%'}}/>
            </div>
            <div className="skeleton rounded-md" style={{height: 20, width: 60}}/>
            <div className="skeleton rounded-md" style={{height: 28, width: 60}}/>
        </div>
    );
}

export function AdminProposalsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [pagination, setPagination] = useState<{ page: number; totalPages: number; total: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [reviewing, setReviewing] = useState<Proposal | null>(null);
    const [decision, setDecision] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
    const [adminNote, setAdminNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

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

    function startReview(p: Proposal) {
        setReviewing(p);
        setDecision('ACCEPTED');
        setAdminNote('');
        setReviewError('');
    }

    function cancelReview() {
        setReviewing(null);
        setAdminNote('');
        setReviewError('');
    }

    async function handleReview(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!reviewing) return;
        setIsSubmitting(true);
        setReviewError('');

        const body: { status: string; adminNote?: string } = {status: decision};
        if (adminNote.trim()) body.adminNote = adminNote.trim();

        try {
            const res = await api.post<ApiResponse<{ proposal: Proposal }>>(`/proposals/${reviewing.id}/review`, body);
            const updated = res.data.data.proposal;
            setProposals(prev => prev.map(p => p.id === reviewing.id ? updated : p));
            setReviewing(null);
            setAdminNote('');
        } catch (err) {
            setReviewError(parseApiError(err));
        } finally {
            setIsSubmitting(false);
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

                    <div className="mb-6">
                        <h1 className="font-display text-[22px] font-bold text-white mb-1">Proposals</h1>
                        <p className="text-sm text-slate-500">
                            {isLoading ? 'Loading…' : pagination ? `${pagination.total} total` : ''}
                        </p>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                        {/* List */}
                        <div className="rounded-xl border border-white/6.5 bg-[#080f22] overflow-hidden">
                            {isLoading
                                ? Array.from({length: 7}).map((_, i) => <SkeletonRow key={i}/>)
                                : proposals.length === 0
                                    ? (
                                        <div className="flex flex-col items-center py-12 text-center">
                                            <p className="text-sm text-white mb-1">No proposals</p>
                                            <p className="text-sm text-slate-600">
                                                {status ? 'Try a different filter' : 'None submitted yet'}
                                            </p>
                                        </div>
                                    )
                                    : proposals.map((p, i) => (
                                        <div
                                            key={p.id}
                                            className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${reviewing?.id === p.id ? 'bg-blue-500/5' : ''} ${i < proposals.length - 1 ? 'border-b border-white/5' : ''}`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                                                <p className="text-xs text-slate-600 mt-0.5">
                                                    {p.user?.username ?? '—'} · {new Date(p.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${STATUS_CLASS[p.status]}`}>
                                                {STATUS_LABEL[p.status]}
                                            </span>
                                            {p.status === 'PENDING' && (
                                                <button
                                                    onClick={() => reviewing?.id === p.id ? cancelReview() : startReview(p)}
                                                    className={`text-xs border rounded-md px-2.5 py-1 cursor-pointer transition-colors shrink-0 ${
                                                        reviewing?.id === p.id
                                                            ? 'text-blue-400 bg-blue-400/8 border-blue-400/20'
                                                            : 'text-slate-500 bg-white/4 border-white/8 hover:text-white'
                                                    }`}
                                                >
                                                    {reviewing?.id === p.id ? 'Reviewing' : 'Review'}
                                                </button>
                                            )}
                                        </div>
                                    ))
                            }

                            {!isLoading && pagination && pagination.totalPages > 1 && (
                                <div
                                    className="flex items-center justify-center gap-3 px-5 py-4 border-t border-white/5">
                                    <button
                                        disabled={currentPage <= 1}
                                        onClick={() => setPage(currentPage - 1)}
                                        className="text-sm text-slate-400 bg-white/4 border border-white/8 rounded-lg px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-white transition-colors"
                                    >
                                        ←
                                    </button>
                                    <span
                                        className="text-sm text-slate-500">{currentPage} / {pagination.totalPages}</span>
                                    <button
                                        disabled={currentPage >= pagination.totalPages}
                                        onClick={() => setPage(currentPage + 1)}
                                        className="text-sm text-slate-400 bg-white/4 border border-white/8 rounded-lg px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-white transition-colors"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Review panel */}
                        {reviewing && (
                            <div className="rounded-xl border border-white/6.5 bg-[#080f22] p-6">
                                <h2 className="font-display text-sm font-semibold text-white mb-1">Review proposal</h2>
                                <p className="text-xs text-slate-500 mb-5 truncate">"{reviewing.name}"</p>

                                <div
                                    className="rounded-lg border border-white/5 bg-white/2 px-4 py-3 mb-5 space-y-1.5 text-xs text-slate-500">
                                    <p><span className="text-slate-600">URL:</span> <span
                                        className="font-mono text-slate-400">{reviewing.url}</span></p>
                                    <p><span
                                        className="text-slate-600">Submitted by:</span> {reviewing.user?.username} ({reviewing.user?.email})
                                    </p>
                                    <p><span className="text-slate-600">Description:</span> {reviewing.description}</p>
                                </div>

                                <form onSubmit={handleReview} className="space-y-4">
                                    <div className="flex gap-2">
                                        {(['ACCEPTED', 'REJECTED'] as const).map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setDecision(d)}
                                                className={`flex-1 text-sm rounded-lg px-4 py-2 border transition-colors cursor-pointer ${
                                                    decision === d
                                                        ? d === 'ACCEPTED'
                                                            ? 'text-green-400 bg-green-400/10 border-green-400/25'
                                                            : 'text-red-400 bg-red-400/10 border-red-400/25'
                                                        : 'text-slate-500 bg-white/4 border-white/8 hover:text-white'
                                                }`}
                                            >
                                                {d === 'ACCEPTED' ? 'Accept' : 'Reject'}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Note {decision === 'REJECTED' ? <span className="text-red-400">*</span> :
                                            <span className="text-slate-600">(optional)</span>}
                                        </label>
                                        <textarea
                                            className="auth-input px-3 py-2 rounded-lg text-sm w-full"
                                            value={adminNote}
                                            onChange={e => setAdminNote(e.target.value)}
                                            placeholder={decision === 'REJECTED' ? 'Reason for rejection…' : 'Optional note for the submitter…'}
                                            rows={3}
                                            required={decision === 'REJECTED'}
                                            disabled={isSubmitting}
                                            style={{resize: 'vertical'}}
                                        />
                                    </div>

                                    {reviewError && (
                                        <div
                                            className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3">
                                            {reviewError}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn-primary text-sm rounded-lg px-4 py-2 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Submitting…' : 'Submit review'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelReview}
                                            className="text-sm text-slate-500 bg-white/4 border border-white/8 rounded-lg px-4 py-2 cursor-pointer hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
