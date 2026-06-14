import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const inputCls =
    'w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-teal-500';

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            {children}
        </label>
    );
}

export function InputField({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <Field label={label}>
            <input className={inputCls} {...props} />
        </Field>
    );
}

export function SelectField({
    label,
    children,
    ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <Field label={label}>
            <select className={inputCls} {...props}>
                {children}
            </select>
        </Field>
    );
}

export function TextareaField({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <Field label={label}>
            <textarea className={inputCls} {...props} />
        </Field>
    );
}
