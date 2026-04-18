import axios from 'axios';

export function parseApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (typeof message === 'string' && message.length > 0) return message;
    }
    return 'Something went wrong. Please try again.';
}
