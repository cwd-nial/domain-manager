import Link from "next/link";

import { accessRequests } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function AdminPage() {
  const pending = await db
    .select({ id: accessRequests.id })
    .from(accessRequests)
    .where(eq(accessRequests.status, "pending"));

  const pendingCount = pending.length;

  const sections = [
    { href: "/admin/roles", label: "Roles", description: "Create, edit and delete employee roles" },
    {
      href: "/admin/positions",
      label: "Positions",
      description: "Create, edit and delete employee positions",
    },
    {
      href: "/admin/access-requests",
      label: "Access Requests",
      description: "Review and approve requests for admin access",
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Admin</h1>
      <div className="flex flex-col gap-3">
        {sections.map(({ href, label, description, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-teal-500 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            {badge != null && (
              <span className="ml-3 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
