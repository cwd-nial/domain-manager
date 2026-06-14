import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md';

const variantCls: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-700',
    secondary:
        'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
};

const sizeCls: Record<Size, string> = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
};

export function buttonCls(variant: Variant = 'primary', size: Size = 'md') {
    return `rounded-md text-sm font-medium ${variantCls[variant]} ${sizeCls[size]}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: Props) {
    return <button className={`${buttonCls(variant, size)}${className ? ` ${className}` : ''}`} {...props} />;
}
