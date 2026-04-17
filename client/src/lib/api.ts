import axios from 'axios';
import type {RefreshResponse} from '../types/api';

const REFRESH_TOKEN_KEY = 'refreshToken';

let accessToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
    accessToken = access;
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
    accessToken = null;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export const api = axios.create({
    baseURL: '/api',
    headers: {'Content-Type': 'application/json'},
});

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function drainQueue(token: string) {
    refreshQueue.forEach((resolve) => resolve(token));
    refreshQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status !== 401 || original._retried) {
            return Promise.reject(error);
        }

        original._retried = true;

        const storedRefresh = getRefreshToken();
        if (!storedRefresh) {
            clearTokens();
            window.dispatchEvent(new Event('auth:expired'));
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve) => {
                refreshQueue.push((newToken) => {
                    original.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(original));
                });
            });
        }

        isRefreshing = true;

        try {
            const {data} = await axios.post<{ success: true; data: RefreshResponse }>(
                '/api/auth/refresh',
                {refreshToken: storedRefresh},
            );
            const {accessToken: newAccess, refreshToken: newRefresh} = data.data;
            setTokens(newAccess, newRefresh);
            drainQueue(newAccess);
            original.headers.Authorization = `Bearer ${newAccess}`;

            return api(original);
        } catch {
            clearTokens();
            refreshQueue = [];
            window.dispatchEvent(new Event('auth:expired'));

            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    },
);
