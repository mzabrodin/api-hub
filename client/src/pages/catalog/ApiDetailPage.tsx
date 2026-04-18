import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {AppLayout} from '../../components/ui/AppLayout';
import {Badge, authTypeBadge, corsBadge} from '../../components/ui/Badge';
import {parseApiError} from '../../lib/parseApiError';
import type {Api, ApiResponse} from '../../types/api';
import * as React from "react";
import {api} from "../../lib/api";

const CORS_LABEL: Record<string, string> = {
    AVAILABLE: 'Available',
    UNAVAILABLE: 'Not available',
    UNKNOWN: 'Unknown',
};

function DetailCard({label, children}: { label: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#080f22] border border-white/6.5 rounded-xl p-4 flex flex-col gap-2">
            <span className="font-display text-[10px] font-bold tracking-widest uppercase text-slate-600">
                {label}
            </span>
            <div>{children}</div>
        </div>
    );
}

function SkeletonDetail() {
    return (
        <div className="max-w-2xl space-y-5">
            <div className="skeleton" style={{height: 14, width: 100}}/>
            <div className="skeleton" style={{height: 30, width: '55%'}}/>
            <div className="flex gap-2">
                <div className="skeleton rounded-md" style={{height: 22, width: 80}}/>
                <div className="skeleton rounded-md" style={{height: 22, width: 64}}/>
            </div>
            <div className="skeleton" style={{height: 68, width: '100%'}}/>
            <div className="skeleton" style={{height: 52, width: '100%'}}/>
            <div className="grid grid-cols-2 gap-3">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton" style={{height: 72}}/>
                ))}
            </div>
        </div>
    );
}

export function ApiDetailPage() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [apiData, setApiData] = useState<Api | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        api.get<ApiResponse<{ api: Api }>>(`/catalog-api/${id}`)
            .then(res => setApiData(res.data.data.api))
            .catch(err => setError(parseApiError(err)))
            .finally(() => setIsLoading(false));
    }, [id]);

    async function handleCopy() {
        if (!apiData) return;
        await navigator.clipboard.writeText(apiData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

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
                    <div className="max-w-2xl">

                        <button
                            onClick={() => navigate(-1)}
                            className="text-sm text-slate-500 hover:text-slate-200 transition-colors mb-8 bg-transparent border-none cursor-pointer p-0"
                        >
                            ← Back to catalog
                        </button>

                        {isLoading && <SkeletonDetail/>}

                        {error && (
                            <div
                                className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}

                        {!isLoading && apiData && (
                            <div className="space-y-5">
                                <div>
                                    <h1 className="font-display text-[26px] font-bold text-white mb-3 leading-tight">
                                        {apiData.name}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge label={apiData.category.name} variant="blue"/>
                                        <Badge label={apiData.isActive ? 'Active' : 'Inactive'}
                                               variant={apiData.isActive ? 'green' : 'gray'}/>
                                    </div>
                                </div>

                                <div
                                    className="flex items-center gap-2 bg-[#080f22] border border-white/6.5 rounded-xl px-4 py-3 overflow-hidden">
                                    <span className="font-mono text-sm text-slate-400 flex-1 truncate">
                                        {apiData.url}
                                    </span>
                                    <div className="flex gap-1.5 shrink-0">
                                        <a
                                            href={apiData.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-slate-500 hover:text-blue-400 bg-white/4 border border-white/8 rounded-md px-2.5 py-1 transition-colors no-underline"
                                        >
                                            Open
                                        </a>
                                        <button
                                            onClick={handleCopy}
                                            className={`text-xs border rounded-md px-2.5 py-1 cursor-pointer transition-colors ${
                                                copied
                                                    ? 'text-green-400 bg-green-400/8 border-green-400/20'
                                                    : 'text-slate-500 bg-white/4 border-white/8 hover:text-white'
                                            }`}
                                        >
                                            {copied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-[#080f22] border border-white/6.5 rounded-xl px-5 py-4">
                                    <p className="font-display text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-2.5">
                                        Description
                                    </p>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        {apiData.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <DetailCard label="Protocol">
                                        <Badge label={apiData.isHttps ? 'HTTPS' : 'HTTP'}
                                               variant={apiData.isHttps ? 'green' : 'amber'}/>
                                    </DetailCard>
                                    <DetailCard label="Authentication">
                                        {authTypeBadge(apiData.authType)}
                                    </DetailCard>
                                    <DetailCard label="Pricing">
                                        <Badge label={apiData.isFree ? 'Free' : 'Paid'}
                                               variant={apiData.isFree ? 'green' : 'slate'}/>
                                    </DetailCard>
                                    <DetailCard label="CORS">
                                        <div className="flex items-center gap-2">
                                            {corsBadge(apiData.corsStatus)}
                                            <span
                                                className="text-xs text-slate-600">{CORS_LABEL[apiData.corsStatus]}</span>
                                        </div>
                                    </DetailCard>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
