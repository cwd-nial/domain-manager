import Link from "next/link";

import { DeleteLookupButton } from "@/components/admin/DeleteLookupButton";
import { roles } from "@/drizzle/schema";
import { db } from "@/lib/db";

export default async function AdminRolesPage() {
  const all = await db.select().from(roles).orderBy(roles.name);

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Roles</h1>
        <Link
          href="/admin/roles/new"
          className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 dark:bg-teal-600 text-white hover:bg-blue-700 dark:hover:bg-teal-700"
        >
          + New Role
        </Link>
      </div>

      {all.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No roles yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {all.map((role) => (
            <li
              key={role.id}
              className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900"
            >
              <span className="text-sm text-gray-900 dark:text-gray-100">{role.name}</span>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/roles/${role.id}/edit`}
                  className="text-sm text-blue-600 dark:text-teal-400 hover:underline"
                >
                  Edit
                </Link>
                <DeleteLookupButton apiUrl={`/api/roles/${role.id}`} label={role.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <Link href="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          ← Back to Admin
        </Link>
      </div>
    </div>
  );
}
