export type NameFormat = "FL" | "LF";

export function formatName(
  firstName: string,
  lastName: string,
  format: NameFormat,
): string {
  const f = firstName.trim();
  const l = lastName.trim();
  if (!l) return f;
  if (!f) return l;
  return format === "FL" ? `${f} ${l}` : `${l}, ${f}`;
}

export function sortKey(
  firstName: string,
  lastName: string,
  format: NameFormat,
): string {
  const f = firstName.trim();
  const l = lastName.trim();
  return format === "FL"
    ? `${f} ${l}`.toLowerCase()
    : `${l} ${f}`.toLowerCase();
}
