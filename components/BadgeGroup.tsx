type BadgeGroupProps = {
    items: string[];
    variant: 'role' | 'position';
};

export function BadgeGroup({ items, variant }: BadgeGroupProps) {
    if (items.length === 0) return null;
    const cls =
        variant === 'role'
            ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:ring-purple-700'
            : 'bg-teal-100 text-teal-800 ring-1 ring-teal-200 dark:bg-teal-900 dark:text-teal-200 dark:ring-teal-700';
    return (
        <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
            {items.map((item) => (
                <li key={item} className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
                    {item}
                </li>
            ))}
        </ul>
    );
}
