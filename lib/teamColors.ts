export const TEAM_COLOR_CLASSES: readonly string[] = [
  "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:ring-indigo-700",
  "bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:ring-blue-700",
  "bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:ring-cyan-700",
  "bg-teal-100 text-teal-800 ring-1 ring-teal-200 dark:bg-teal-900 dark:text-teal-200 dark:ring-teal-700",
  "bg-green-100 text-green-800 ring-1 ring-green-200 dark:bg-green-900 dark:text-green-200 dark:ring-green-700",
  "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:ring-amber-700",
  "bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-900 dark:text-rose-200 dark:ring-rose-700",
  "bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:ring-purple-700",
];

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function teamColorClass(teamId: string): string {
  return TEAM_COLOR_CLASSES[simpleHash(teamId) % TEAM_COLOR_CLASSES.length];
}
