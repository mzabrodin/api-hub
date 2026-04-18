import {useState, useEffect} from 'react';
import {AppLayout} from '../../components/ui/AppLayout';
import {api} from '../../lib/api';
import {parseApiError} from '../../lib/parseApiError';
import {useAuth} from '../../hooks/useAuth';
import type {User, ApiResponse, UserRole} from '../../types/api';

function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5">
            <div className="flex-1 space-y-1.5">
                <div className="skeleton" style={{height: 13, width: '30%'}}/>
                <div className="skeleton" style={{height: 11, width: '45%'}}/>
            </div>
            <div className="skeleton rounded-md" style={{height: 20, width: 52}}/>
            <div className="skeleton rounded-md" style={{height: 28, width: 80}}/>
        </div>
    );
}

export function AdminUsersPage() {
    const {user: currentUser} = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get<ApiResponse<{ users: User[] }>>('/users')
            .then(res => setUsers(res.data.data.users))
            .catch(err => setError(parseApiError(err)))
            .finally(() => setIsLoading(false));
    }, []);

    async function handleRoleToggle(user: User) {
        const newRole: UserRole = 'ADMIN';
        setUpdatingRole(user.id);
        try {
            const res = await api.patch<ApiResponse<{ user: User }>>(`/users/${user.id}/role`, {role: newRole});
            setUsers(prev => prev.map(u => u.id === user.id ? res.data.data.user : u));
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setUpdatingRole(null);
        }
    }

    const filtered = search.trim()
        ? users.filter(u =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        )
        : users;

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
                        <h1 className="font-display text-[22px] font-bold text-white mb-1">Users</h1>
                        <p className="text-sm text-slate-500">
                            {isLoading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="mb-6 max-w-sm">
                        <input
                            type="search"
                            placeholder="Filter by name or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="auth-input px-3 py-1.5 rounded-lg text-sm w-full"
                        />
                    </div>

                    {error && (
                        <div
                            className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <div className="rounded-xl border border-white/6.5 bg-[#080f22] overflow-hidden">
                        {isLoading
                            ? Array.from({length: 6}).map((_, i) => <SkeletonRow key={i}/>)
                            : filtered.length === 0
                                ? (
                                    <div className="flex flex-col items-center py-12 text-center">
                                        <p className="text-sm text-white mb-1">{search ? 'No users match' : 'No users'}</p>
                                        {search && <p className="text-sm text-slate-600">Try a different search</p>}
                                    </div>
                                )
                                : filtered.map((u, i) => (
                                    <div
                                        key={u.id}
                                        className={`flex items-center gap-4 px-5 py-3.5 ${i < filtered.length - 1 ? 'border-b border-white/5' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white">{u.username}</p>
                                                {!u.isEmailVerified && (
                                                    <span
                                                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20">
                                                        Unverified
                                                    </span>
                                                )}
                                                {u.id === currentUser?.id && (
                                                    <span
                                                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/4 text-slate-500 border border-white/8">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 mt-0.5">{u.email}</p>
                                        </div>

                                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md shrink-0 ${
                                            u.role === 'ADMIN'
                                                ? 'bg-violet-400/10 text-violet-400 border border-violet-400/20'
                                                : 'bg-white/4 text-slate-500 border border-white/8'
                                        }`}>
                                            {u.role}
                                        </span>

                                        {u.role === 'USER' && u.id !== currentUser?.id && (
                                            <button
                                                onClick={() => handleRoleToggle(u)}
                                                disabled={updatingRole === u.id}
                                                className="text-xs text-slate-500 bg-white/4 border border-white/8 rounded-md px-2.5 py-1 cursor-pointer hover:text-violet-400 hover:border-violet-400/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                            >
                                                {updatingRole === u.id ? '…' : 'Make admin'}
                                            </button>
                                        )}
                                    </div>
                                ))
                        }
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
