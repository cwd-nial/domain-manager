type BadgeGroupProps = {
  items: string[];
  variant: "role" | "position";
};

export function BadgeGroup({ items, variant }: BadgeGroupProps) {
  if (items.length === 0) return null;
  const cls =
    variant === "role"
      ? "bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:ring-purple-700"
      : "bg-teal-100 text-teal-800 ring-1 ring-teal-200 dark:bg-teal-900 dark:text-teal-200 dark:ring-teal-700";
  return (
    <ul className="flex flex-wrap gap-1 list-none p-0 m-0">
      {items.map((item) => (
        <li key={item} className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}
