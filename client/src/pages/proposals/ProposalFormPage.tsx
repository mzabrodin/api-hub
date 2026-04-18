import {useState, useEffect} from 'react';
import {useParams, useNavigate, Navigate} from 'react-router-dom';
import {AppLayout} from '../../components/ui/AppLayout';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import {useAuth} from '../../hooks/useAuth';
import type {Category, Proposal, ApiResponse} from '../../types/api';
import * as React from "react";

interface FormState {
    name: string;
    description: string;
    url: string;
    categoryId: string;
    isHttps: string;
    isFree: string;
    authType: string;
    corsStatus: string;
}

const EMPTY: FormState = {
    name: '',
    description: '',
    url: '',
    categoryId: '',
    isHttps: 'true',
    isFree: 'true',
    authType: 'NONE',
    corsStatus: 'UNKNOWN',
};

function fromProposal(p: Proposal): FormState {
    return {
        name: p.name,
        description: p.description,
        url: p.url,
        categoryId: p.categoryId,
        isHttps: String(p.isHttps),
        isFree: String(p.isFree),
        authType: p.authType,
        corsStatus: p.corsStatus,
    };
}

export function ProposalFormPage() {
    const {user} = useAuth();
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    if (user?.role === 'ADMIN') return <Navigate to="/catalog" replace/>;

    const [form, setForm] = useState<FormState>(EMPTY);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get<ApiResponse<{ categories: Category[] }>>('/categories')
            .then(res => setCategories(res.data.data.categories))
            .catch(() => {
            });
    }, []);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        api.get<ApiResponse<{ proposal: Proposal }>>(`/proposals/${id}`)
            .then(res => {
                const p = res.data.data.proposal;
                if (p.status !== 'PENDING') {
                    navigate('/proposals', {replace: true});
                    return;
                }
                setForm(fromProposal(p));
            })
            .catch(err => setError(parseApiError(err)))
            .finally(() => setIsLoading(false));
    }, [id, navigate]);

    function set(key: keyof FormState, value: string) {
        setForm(prev => ({...prev, [key]: value}));
    }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const body = {
            name: form.name,
            description: form.description,
            url: form.url,
            categoryId: form.categoryId,
            isHttps: form.isHttps === 'true',
            isFree: form.isFree === 'true',
            authType: form.authType,
            corsStatus: form.corsStatus,
        };

        try {
            if (isEdit) {
                await api.patch(`/proposals/${id}`, body);
            } else {
                await api.post('/proposals', body);
            }
            navigate('/proposals');
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputCls = 'auth-input px-3 py-2 rounded-lg text-sm w-full';
    const selectCls = 'dark-select pl-3 py-2 rounded-lg text-sm w-full';
    const labelCls = 'block text-xs font-medium text-slate-500 mb-1.5';

    return (
        <AppLayout>
            <div
                className="min-h-screen"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-9 pb-20">
                    <div className="max-w-xl">

                        <button
                            onClick={() => navigate(-1)}
                            className="text-sm text-slate-500 hover:text-slate-200 transition-colors mb-8 bg-transparent border-none cursor-pointer p-0"
                        >
                            ← Back
                        </button>

                        <h1 className="font-display text-[22px] font-bold text-white mb-1">
                            {isEdit ? 'Edit proposal' : 'Submit a proposal'}
                        </h1>
                        <p className="text-sm text-slate-500 mb-8">
                            {isEdit ? 'Update your pending API proposal.' : 'Suggest a new API to add to the catalog.'}
                        </p>

                        {isLoading ? (
                            <div className="space-y-5">
                                {Array.from({length: 4}).map((_, i) => (
                                    <div key={i}>
                                        <div className="skeleton mb-1.5" style={{height: 12, width: 80}}/>
                                        <div className="skeleton rounded-lg" style={{height: 38}}/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className={labelCls}>API Name</label>
                                    <input
                                        className={inputCls}
                                        type="text"
                                        value={form.name}
                                        onChange={e => set('name', e.target.value)}
                                        placeholder="e.g. OpenWeather API"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Description</label>
                                    <textarea
                                        className={inputCls}
                                        value={form.description}
                                        onChange={e => set('description', e.target.value)}
                                        placeholder="What does this API do?"
                                        rows={3}
                                        required
                                        disabled={isSubmitting}
                                        style={{resize: 'vertical'}}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>URL</label>
                                    <input
                                        className={inputCls}
                                        type="url"
                                        value={form.url}
                                        onChange={e => set('url', e.target.value)}
                                        placeholder="https://api.example.com"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Category</label>
                                    <select
                                        className={selectCls}
                                        value={form.categoryId}
                                        onChange={e => set('categoryId', e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Protocol</label>
                                        <select className={selectCls} value={form.isHttps}
                                                onChange={e => set('isHttps', e.target.value)}
                                                disabled={isSubmitting}>
                                            <option value="true">HTTPS</option>
                                            <option value="false">HTTP</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Pricing</label>
                                        <select className={selectCls} value={form.isFree}
                                                onChange={e => set('isFree', e.target.value)}
                                                disabled={isSubmitting}>
                                            <option value="true">Free</option>
                                            <option value="false">Paid</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelCls}>Authentication</label>
                                        <select className={selectCls} value={form.authType}
                                                onChange={e => set('authType', e.target.value)}
                                                disabled={isSubmitting}>
                                            <option value="NONE">No auth</option>
                                            <option value="API_KEY">API Key</option>
                                            <option value="OAUTH">OAuth</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelCls}>CORS</label>
                                        <select className={selectCls} value={form.corsStatus}
                                                onChange={e => set('corsStatus', e.target.value)}
                                                disabled={isSubmitting}>
                                            <option value="UNKNOWN">Unknown</option>
                                            <option value="AVAILABLE">Available</option>
                                            <option value="UNAVAILABLE">Unavailable</option>
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary text-sm rounded-lg px-5 py-2.5 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit proposal'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="text-sm text-slate-500 bg-white/4 border border-white/8 rounded-lg px-5 py-2.5 cursor-pointer hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
