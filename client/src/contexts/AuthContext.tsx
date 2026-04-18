import {createContext, useEffect, useState, useCallback} from 'react';
import type {ReactNode} from 'react';
import {api, setTokens, clearTokens, getRefreshToken} from '../lib/api';
import type {User, LoginResponse, RefreshResponse} from '../types/api';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<User>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const bootstrap = useCallback(async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            setIsLoading(false);
            return;
        }

        try {
            const {data: refreshData} = await api.post<{ success: true; data: RefreshResponse }>(
                '/auth/refresh',
                {refreshToken},
            );
            setTokens(refreshData.data.accessToken, refreshData.data.refreshToken);

            const {data: meData} = await api.get<{ success: true; data: { user: User } }>('/users/me');
            setUser(meData.data.user);
        } catch {
            clearTokens();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    useEffect(() => {
        const handleExpired = () => setUser(null);
        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const {data} = await api.post<{ success: true; data: LoginResponse }>('/auth/login', {
            email,
            password,
        });
        setTokens(data.data.accessToken, data.data.refreshToken);
        setUser(data.data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // ignore to clear local state anyway
        } finally {
            clearTokens();
            setUser(null);
        }
    }, []);

    const register = useCallback(async (email: string, password: string, username: string) => {
        const {data} = await api.post<{ success: true; data: { user: User } }>('/auth/register', {
            email,
            password,
            username,
        });
        return data.data.user;
    }, []);

    return (
        <AuthContext.Provider value={{user, isLoading, login, logout, register}}>
            {children}
        </AuthContext.Provider>
    );
}
