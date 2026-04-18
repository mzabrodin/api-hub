import {useState, useEffect} from 'react';
import {AppLayout} from '../../components/ui/AppLayout';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import type {Category, ApiResponse} from '../../types/api';
import * as React from "react";

interface FormState {
    name: string;
    description: string;
}

const EMPTY: FormState = {name: '', description: ''};

export function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [listError, setListError] = useState('');

    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    const isEdit = Boolean(editing);

    useEffect(() => {
        setIsLoading(true);
        api.get<ApiResponse<{ categories: Category[] }>>('/categories')
            .then(res => setCategories(res.data.data.categories))
            .catch(err => setListError(parseApiError(err)))
            .finally(() => setIsLoading(false));
    }, []);

    function startEdit(cat: Category) {
        setEditing(cat);
        setForm({name: cat.name, description: cat.description ?? ''});
        setFormError('');
    }

    function startCreate() {
        setEditing(null);
        setForm(EMPTY);
        setFormError('');
    }

    function set(key: keyof FormState, value: string) {
        setForm(prev => ({...prev, [key]: value}));
    }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        const body = {
            name: form.name,
            ...(form.description.trim() && {description: form.description.trim()}),
        };

        try {
            if (isEdit && editing) {
                const res = await api.patch<ApiResponse<{ category: Category }>>(`/categories/${editing.id}`, body);
                setCategories(prev => prev.map(c => c.id === editing.id ? res.data.data.category : c));
            } else {
                const res = await api.post<ApiResponse<{ category: Category }>>('/categories', body);
                setCategories(prev => [...prev, res.data.data.category].sort((a, b) => a.name.localeCompare(b.name)));
            }
            setEditing(null);
            setForm(EMPTY);
        } catch (err) {
            setFormError(parseApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(cat: Category) {
        if (!confirm(`Delete "${cat.name}"? This will fail if APIs are assigned to it.`)) return;
        setDeleting(cat.id);
        try {
            await api.delete(`/categories/${cat.id}`);
            setCategories(prev => prev.filter(c => c.id !== cat.id));
            if (editing?.id === cat.id) {
                setEditing(null);
                setForm(EMPTY);
            }
        } catch (err) {
            setListError(parseApiError(err));
        } finally {
            setDeleting(null);
        }
    }

    const inputCls = 'auth-input px-3 py-2 rounded-lg text-sm w-full';
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
                <div className="max-w-7xl mx-auto px-6 py-9 pb-16">
                    <h1 className="font-display text-[22px] font-bold text-white mb-1">Categories</h1>
                    <p className="text-sm text-slate-500 mb-8">
                        {isLoading ? 'Loading…' : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* List */}
                        <div className="rounded-xl border border-white/6.5 bg-[#080f22] overflow-hidden">
                            {listError && (
                                <div className="text-sm text-red-400 bg-red-500/8 border-b border-red-500/20 px-5 py-3">
                                    {listError}
                                </div>
                            )}
                            {isLoading
                                ? Array.from({length: 6}).map((_, i) => (
                                    <div key={i}
                                         className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
                                        <div className="flex-1 space-y-1.5">
                                            <div className="skeleton" style={{height: 13, width: '45%'}}/>
                                            <div className="skeleton" style={{height: 11, width: '70%'}}/>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className="skeleton rounded-md" style={{height: 28, width: 44}}/>
                                            <div className="skeleton rounded-md" style={{height: 28, width: 52}}/>
                                        </div>
                                    </div>
                                ))
                                : categories.length === 0
                                    ? (
                                        <div className="flex flex-col items-center py-12 text-center">
                                            <p className="text-sm text-white mb-1">No categories yet</p>
                                            <p className="text-sm text-slate-600">Use the form to add the first one</p>
                                        </div>
                                    )
                                    : categories.map((cat, i) => (
                                        <div
                                            key={cat.id}
                                            className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${editing?.id === cat.id ? 'bg-blue-500/5' : ''} ${i < categories.length - 1 ? 'border-b border-white/5' : ''}`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white">{cat.name}</p>
                                                {cat.description && (
                                                    <p className="text-xs text-slate-600 truncate mt-0.5">{cat.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    onClick={() => editing?.id === cat.id ? startCreate() : startEdit(cat)}
                                                    className={`text-xs border rounded-md px-2.5 py-1 cursor-pointer transition-colors ${
                                                        editing?.id === cat.id
                                                            ? 'text-blue-400 bg-blue-400/8 border-blue-400/20'
                                                            : 'text-slate-500 bg-white/4 border-white/8 hover:text-white'
                                                    }`}
                                                >
                                                    {editing?.id === cat.id ? 'Editing' : 'Edit'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat)}
                                                    disabled={deleting === cat.id}
                                                    className="text-xs text-slate-500 bg-white/4 border border-white/8 rounded-md px-2.5 py-1 cursor-pointer hover:text-red-400 hover:border-red-400/20 transition-colors disabled:opacity-40"
                                                >
                                                    {deleting === cat.id ? '…' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            }
                        </div>

                        {/* Form */}
                        <div className="rounded-xl border border-white/6.5 bg-[#080f22] p-6">
                            <h2 className="font-display text-sm font-semibold text-white mb-5">
                                {isEdit ? `Editing "${editing!.name}"` : 'New category'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className={labelCls}>Name</label>
                                    <input
                                        className={inputCls}
                                        type="text"
                                        value={form.name}
                                        onChange={e => set('name', e.target.value)}
                                        placeholder="e.g. Weather"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Description <span
                                        className="text-slate-600">(optional)</span></label>
                                    <textarea
                                        className={inputCls}
                                        value={form.description}
                                        onChange={e => set('description', e.target.value)}
                                        placeholder="Short description of this category"
                                        rows={3}
                                        disabled={isSubmitting}
                                        style={{resize: 'vertical'}}
                                    />
                                </div>

                                {formError && (
                                    <div
                                        className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3">
                                        {formError}
                                    </div>
                                )}

                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary text-sm rounded-lg px-4 py-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
                                    </button>
                                    {isEdit && (
                                        <button
                                            type="button"
                                            onClick={startCreate}
                                            className="text-sm text-slate-500 bg-white/4 border border-white/8 rounded-lg px-4 py-2 cursor-pointer hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
