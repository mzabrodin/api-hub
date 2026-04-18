import {useState} from 'react';
import {AppLayout} from '../components/ui/AppLayout';
import {api} from '../lib/api';
import {parseApiError} from '../lib/parseApiError';
import {useAuth} from '../hooks/useAuth';
import type {User, ApiResponse} from '../types/api';
import * as React from "react";

export function ProfilePage() {
    const {user} = useAuth();

    const [username, setUsername] = useState(user?.username ?? '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    async function handleProfileSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError('');
        setProfileSuccess(false);
        try {
            const res = await api.patch<ApiResponse<{ user: User }>>('/users/me', {username});
            await api.get<ApiResponse<{ user: User }>>('/users/me');
            setUsername(res.data.data.user.username);
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (err) {
            setProfileError(parseApiError(err));
        } finally {
            setProfileSaving(false);
        }
    }

    async function handlePasswordSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setPasswordSaving(true);
        setPasswordError('');
        setPasswordSuccess(false);
        try {
            await api.post('/auth/change-password', {currentPassword, newPassword});
            setCurrentPassword('');
            setNewPassword('');
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (err) {
            setPasswordError(parseApiError(err));
        } finally {
            setPasswordSaving(false);
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
                <div className="max-w-7xl mx-auto px-6 py-9 pb-20">
                    <h1 className="font-display text-[22px] font-bold text-white mb-1">Profile</h1>
                    <p className="text-sm text-slate-500 mb-8">Manage your account settings</p>

                    <div className="max-w-md space-y-6">

                        {/* Account info */}
                        <div className="rounded-xl border border-white/6.5 bg-[#080f22] p-6">
                            <h2 className="font-display text-sm font-semibold text-white mb-4">Account</h2>
                            <div className="space-y-3 mb-5">
                                <div>
                                    <p className={labelCls}>Email</p>
                                    <p className="text-sm text-slate-400">{user?.email}</p>
                                </div>
                                <div>
                                    <p className={labelCls}>Role</p>
                                    <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                                        user?.role === 'ADMIN'
                                            ? 'bg-violet-400/10 text-violet-400 border border-violet-400/20'
                                            : 'bg-white/4 text-slate-500 border border-white/8'
                                    }`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div>
                                    <label className={labelCls}>Username</label>
                                    <input
                                        className={inputCls}
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        required
                                        disabled={profileSaving}
                                    />
                                </div>

                                {profileError && (
                                    <div
                                        className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3">
                                        {profileError}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={profileSaving || username === user?.username}
                                        className="btn-primary text-sm rounded-lg px-4 py-2 disabled:opacity-50"
                                    >
                                        {profileSaving ? 'Saving…' : 'Save'}
                                    </button>
                                    {profileSuccess && (
                                        <span className="text-sm text-green-400">Username updated</span>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Change password */}
                        <div className="rounded-xl border border-white/6.5 bg-[#080f22] p-6">
                            <h2 className="font-display text-sm font-semibold text-white mb-4">Change password</h2>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className={labelCls}>Current password</label>
                                    <input
                                        className={inputCls}
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                        disabled={passwordSaving}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>New password</label>
                                    <input
                                        className={inputCls}
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                        disabled={passwordSaving}
                                    />
                                    <p className="text-xs text-slate-600 mt-1.5">
                                        Min 8 chars, uppercase, lowercase, digit &amp; special character.
                                    </p>
                                </div>

                                {passwordError && (
                                    <div
                                        className="text-sm text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3">
                                        {passwordError}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={passwordSaving}
                                        className="btn-primary text-sm rounded-lg px-4 py-2 disabled:opacity-50"
                                    >
                                        {passwordSaving ? 'Saving…' : 'Change password'}
                                    </button>
                                    {passwordSuccess && (
                                        <span className="text-sm text-green-400">Password changed</span>
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
