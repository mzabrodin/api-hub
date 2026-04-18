import type {InputHTMLAttributes} from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

export function FormField({label, error, id, className: _cls, ...inputProps}: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-xs font-medium uppercase tracking-widest"
                style={{color: '#94a3b8', fontFamily: 'Syne, sans-serif', letterSpacing: '0.09em'}}
            >
                {label}
            </label>
            <input
                id={id}
                {...inputProps}
                className={`auth-input px-4 py-2.5 rounded-lg text-sm ${error ? 'auth-input-error' : ''}`}
            />
            {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
        </div>
    );
}
