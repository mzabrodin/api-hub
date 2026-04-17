export interface ApiResponse<T> {
    success: true;
    data: T;
}

export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type UserRole = 'USER' | 'ADMIN';
export type CorsStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
export type AuthType = 'NONE' | 'API_KEY' | 'OAUTH';
export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}
