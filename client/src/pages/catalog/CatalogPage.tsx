import {useState, useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {AppLayout} from '../../components/ui/AppLayout';
import {Badge, authTypeBadge, corsBadge} from '../../components/ui/Badge';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import type {Api, Category, PaginatedResponse, ApiResponse} from '../../types/api';

function ApiCard({entry}: { entry: Api }) {
    return (
        <Link
            to={`/catalog/${entry.id}`}
            className="api-card block rounded-xl p-5 bg-[#080f22] border border-white/6.5 no-underline"
            style={{boxShadow: '0 2px 12px rgba(0,0,0,0.3)'}}
        >
            <div className="mb-2">
                <h3 className="font-display font-semibold text-[15px] text-white leading-snug m-0">
                    {entry.name}
                </h3>
            </div>

            <p className="text-sm text-slate-500 mb-3 leading-relaxed line-clamp-2">
                {entry.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
                <Badge label={entry.category.name} variant="blue"/>
                {entry.isHttps && <Badge label="HTTPS" variant="green"/>}
                {entry.isFree && <Badge label="Free" variant="green"/>}
                {authTypeBadge(entry.authType)}
                {corsBadge(entry.corsStatus)}
            </div>
        </Link>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-xl p-5 bg-[#080f22] border border-white/6.5">
            <div className="skeleton mb-2.5" style={{height: 18, width: '60%'}}/>
            <div className="skeleton mb-1.5" style={{height: 13, width: '100%'}}/>
            <div className="skeleton mb-3" style={{height: 13, width: '75%'}}/>
            <div className="flex gap-1.5">
                <div className="skeleton rounded-md" style={{height: 20, width: 60}}/>
                <div className="skeleton rounded-md" style={{height: 20, width: 48}}/>
                <div className="skeleton rounded-md" style={{height: 20, width: 52}}/>
            </div>
        </div>
    );
}

export function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [inputValue, setInputValue] = useState(searchParams.get('search') ?? '');
    const [categories, setCategories] = useState<Category[]>([]);
    const [apis, setApis] = useState<Api[]>([]);
    const [pagination, setPagination] = useState<{
        page: number;
        limit: number;
        total: number;
        totalPages: number
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get<ApiResponse<{categories: Category[]}>>('/categories')
            .then(res => setCategories(res.data.data.categories))
            .catch(() => {
            });
    }, []);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setError('');

        const params: Record<string, string> = {};
        searchParams.forEach((v, k) => {
            params[k] = v;
        });

        api.get<PaginatedResponse<Api>>('/catalog-api', {params})
            .then(res => {
                if (cancelled) return;
                setApis(res.data.data);
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

    function clearFilters() {
        setInputValue('');
        setSearchParams({}, {replace: true});
    }

    const hasFilters = Array.from(searchParams.entries()).length > 0;
    const currentPage = Number(searchParams.get('page') ?? '1');

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

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-display text-[22px] font-bold text-white mb-1">API Catalog</h1>
                        <p className="text-sm text-slate-500">
                            {isLoading ? 'Loading…' : pagination ? `${pagination.total.toLocaleString()} API${pagination.total !== 1 ? 's' : ''} found` : ''}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-7 items-center">
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

                        <select className={selectCls} value={searchParams.get('categoryId') ?? ''}
                                onChange={e => setFilter('categoryId', e.target.value)}>
                            <option value="">All categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <select className={selectCls} value={searchParams.get('authType') ?? ''}
                                onChange={e => setFilter('authType', e.target.value)}>
                            <option value="">Any auth</option>
                            <option value="NONE">No auth</option>
                            <option value="API_KEY">API Key</option>
                            <option value="OAUTH">OAuth</option>
                        </select>

                        <select className={selectCls} value={searchParams.get('isHttps') ?? ''}
                                onChange={e => setFilter('isHttps', e.target.value)}>
                            <option value="">HTTPS: any</option>
                            <option value="true">HTTPS only</option>
                            <option value="false">HTTP only</option>
                        </select>

                        <select className={selectCls} value={searchParams.get('isFree') ?? ''}
                                onChange={e => setFilter('isFree', e.target.value)}>
                            <option value="">Any price</option>
                            <option value="true">Free only</option>
                            <option value="false">Paid only</option>
                        </select>

                        <select className={selectCls} value={searchParams.get('corsStatus') ?? ''}
                                onChange={e => setFilter('corsStatus', e.target.value)}>
                            <option value="">Any CORS</option>
                            <option value="AVAILABLE">CORS available</option>
                            <option value="UNAVAILABLE">No CORS</option>
                            <option value="UNKNOWN">CORS unknown</option>
                        </select>

                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-slate-400 bg-white/4 border border-white/8 rounded-lg px-3 py-1.5 cursor-pointer hover:text-white transition-colors"
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>

                    {error && (
                        <div
                            className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {isLoading
                            ? Array.from({length: 9}).map((_, i) => <SkeletonCard key={i}/>)
                            : apis.length === 0
                                ? (
                                    <div className="col-span-full flex flex-col items-center py-16 text-center">
                                            <p className="text-sm font-medium text-white mb-1">No APIs found</p>
                                        <p className="text-sm text-slate-600">Try adjusting your filters</p>
                                        {hasFilters && (
                                            <button onClick={clearFilters}
                                                    className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-transparent border-none cursor-pointer p-0">
                                                Clear all filters
                                            </button>
                                        )}
                                    </div>
                                )
                                : apis.map(a => <ApiCard key={a.id} entry={a}/>)
                        }
                    </div>

                    {/* Pagination */}
                    {!isLoading && pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-10">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => setPage(currentPage - 1)}
                                className="text-sm text-slate-400 bg-white/4 border border-white/8 rounded-lg px-4 py-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:text-white transition-colors"
                            >
                                ← Previous
                            </button>
                            <span className="text-sm text-slate-500">
                                Page {currentPage} of {pagination.totalPages}
                            </span>
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
