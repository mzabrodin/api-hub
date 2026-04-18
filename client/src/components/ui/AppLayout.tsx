import type {ReactNode} from 'react';
import {NavLink, Link, useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';

function NavItem({to, children}: { to: string; children: ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({isActive}) =>
                `text-sm font-medium px-2.5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
                }`
            }
        >
            {children}
        </NavLink>
    );
}

export function AppLayout({children}: { children: ReactNode }) {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        await logout();
        navigate('/login', {replace: true});
    }

    return (
        <div className="min-h-screen bg-[#03070f]">
            <nav className="sticky top-0 z-50 border-b border-white/6 bg-[#03070f]/95 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 flex items-center h-14 gap-1">

                    {/* Brand */}
                    <NavLink to="/catalog" className="mr-4 shrink-0 no-underline">
                        <span className="font-display font-bold text-white text-xs tracking-[0.16em] uppercase">
                            API Hub
                        </span>
                    </NavLink>

                    <NavItem to="/catalog">Catalog</NavItem>
                    {user?.role !== 'ADMIN' && <NavItem to="/proposals">My Proposals</NavItem>}

                    {user?.role === 'ADMIN' && (
                        <>
                            <div className="w-px h-4 bg-white/10 mx-1.5"/>
                            <span
                                className="font-display text-[10px] font-bold tracking-widest uppercase text-white/20 px-1">
                                Admin
                            </span>
                            <NavItem to="/admin/proposals">Proposals</NavItem>
                            <NavItem to="/admin/apis">APIs</NavItem>
                            <NavItem to="/admin/categories">Categories</NavItem>
                            <NavItem to="/admin/users">Users</NavItem>
                        </>
                    )}

                    <div className="flex-1"/>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/profile"
                            className="text-xs text-slate-400 bg-white/4 border border-white/[0.07] rounded-md px-2.5 py-1 hover:text-white transition-colors no-underline"
                        >
                            {user?.username}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-xs text-slate-500 border border-white/8 rounded-md px-3 py-1 cursor-pointer hover:text-red-400 hover:border-red-400/20 transition-colors bg-transparent"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>
            <main key={location.key} style={{animation: 'page-in 0.22s cubic-bezier(0.16,1,0.3,1) both'}}>{children}</main>
        </div>
    );
}
