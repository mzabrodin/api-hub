import {useState, useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {AppLayout} from '../../components/ui/AppLayout';
import {Badge, authTypeBadge, corsBadge} from '../../components/ui/Badge';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import type {Api, Category, PaginatedResponse, ApiResponse} from '../../types/api';

function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05]">
            <div className="flex-1 space-y-1.5">
                <div className="skeleton" style={{height: 13, width: '35%'}}/>
                <div className="skeleton" style={{height: 11, width: '55%'}}/>
            </div>
            <div className="flex gap-1.5">
                <div className="skeleton rounded-md" style={{height: 20, width: 48}}/>
                <div className="skeleton rounded-md" style={{height: 20, width: 48}}/>
            </div>
            <div className="flex gap-1.5">
                <div className="skeleton rounded-md" style={{height: 28, width: 56}}/>
                <div className="skeleton rounded-md" style={{height: 28, width: 56}}/>
                <div className="skeleton rounded-md" style={{height: 28, width: 56}}/>
            </div>
        </div>
    );
}

export function AdminApisPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [inputValue, setInputValue] = useState(searchParams.get('search') ?? '');
    const [apis, setApis] = useState<Api[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<{page: number; totalPages: number; total: number} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [toggling, setToggling] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    const currentPage = Number(searchParams.get('page') ?? '1');

    useEffect(() => {
        api.get<ApiResponse<{categories: Category[]}>>('/categories')
            .then(res => setCategories(res.data.data.categories))
            .catch(() => {});
    }, []);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError('');

        const params: Record<string, string> = {showAll: 'true'};
        searchParams.forEach((v, k) => { params[k] = v; });

        api.get<PaginatedResponse<Api>>('/catalog-api', {params})
            .then(res => {
                if (cancelled) return;
                setApis(res.data.data);
                setPagination(res.data.pagination);
            })
            .catch(err => { if (!cancelled) setError(parseApiError(err)); })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
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

    async function handleToggle(entry: Api) {
        setToggling(entry.id);
        try {
            const res = await api.patch<ApiResponse<{api: Api}>>(`/catalog-api/${entry.id}/toggle`, {isActive: !entry.isActive});
            setApis(prev => prev.map(a => a.id === entry.id ? res.data.data.api : a));
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setToggling(null);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Permanently delete this API?')) return;
        setDeleting(id);
        try {
            await api.delete(`/catalog-api/${id}`);
            setApis(prev => prev.filter(a => a.id !== id));
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
                            <h1 className="font-display text-[22px] font-bold text-white mb-1">APIs</h1>
                            <p className="text-sm text-slate-500">
                                {isLoading ? 'Loading…' : pagination ? `${pagination.total} total` : ''}
                            </p>
                        </div>
                        <Link to="/admin/apis/new" className="btn-primary text-sm rounded-lg px-4 py-2 no-underline">
                            + New API
                        </Link>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6 items-center">
                        <div className="flex-1 min-w-48">
                            <input
                                type="search"
                                placeholder="Search APIs…"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        setSearchParams(prev => {
                                            const next = new URLSearchParams(prev);
                                            inputValue.trim() ? next.set('search', inputValue.trim()) : next.delete('search');
                                            next.delete('page');
                                            return next;
                                        }, {replace: true});
                                    }
                                }}
                                className="auth-input px-3 py-1.5 rounded-lg text-sm w-full"
                            />
                        </div>

                        <select className={selectCls} value={searchParams.get('categoryId') ?? ''} onChange={e => setFilter('categoryId', e.target.value)}>
                            <option value="">All categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <select className={selectCls} value={searchParams.get('isActive') ?? ''} onChange={e => setFilter('isActive', e.target.value)}>
                            <option value="">Any status</option>
                            <option value="true">Active only</option>
                            <option value="false">Inactive only</option>
                        </select>
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <div className="rounded-xl border border-white/[0.065] bg-[#080f22] overflow-hidden">
                        {isLoading
                            ? Array.from({length: 8}).map((_, i) => <SkeletonRow key={i}/>)
                            : apis.length === 0
                                ? (
                                    <div className="flex flex-col items-center py-16 text-center">
                                        <p className="text-sm font-medium text-white mb-1">No APIs found</p>
                                        <p className="text-sm text-slate-600">Try adjusting filters or add a new API</p>
                                    </div>
                                )
                                : apis.map((entry, i) => (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center gap-3 px-5 py-3.5 ${i < apis.length - 1 ? 'border-b border-white/[0.05]' : ''} ${!entry.isActive ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{entry.name}</p>
                                            <p className="text-xs text-slate-600 truncate mt-0.5">{entry.url}</p>
                                        </div>

                                        <div className="hidden sm:flex flex-wrap gap-1.5 shrink-0">
                                            <Badge label={entry.category.name} variant="blue"/>
                                            {authTypeBadge(entry.authType)}
                                            {corsBadge(entry.corsStatus)}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() => handleToggle(entry)}
                                                disabled={toggling === entry.id}
                                                className={`text-xs border rounded-md px-2.5 py-1 cursor-pointer transition-colors disabled:opacity-40 ${
                                                    entry.isActive
                                                        ? 'text-green-400 bg-green-400/8 border-green-400/20 hover:bg-green-400/15'
                                                        : 'text-slate-500 bg-white/4 border-white/8 hover:text-white'
                                                }`}
                                            >
                                                {toggling === entry.id ? '…' : entry.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                            <Link
                                                to={`/admin/apis/${entry.id}/edit`}
                                                className="text-xs text-slate-500 bg-white/4 border border-white/8 rounded-md px-2.5 py-1 hover:text-white transition-colors no-underline"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                disabled={deleting === entry.id}
                                                className="text-xs text-slate-500 bg-white/4 border border-white/8 rounded-md px-2.5 py-1 cursor-pointer hover:text-red-400 hover:border-red-400/20 transition-colors disabled:opacity-40"
                                            >
                                                {deleting === entry.id ? '…' : 'Delete'}
                                            </button>
                                        </div>
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
                            <span className="text-sm text-slate-500">Page {currentPage} of {pagination.totalPages}</span>
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
