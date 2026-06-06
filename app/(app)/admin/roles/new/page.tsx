import Link from "next/link";

import { LookupForm } from "@/components/admin/LookupForm";

export default function NewRolePage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">New Role</h1>
      <LookupForm apiUrl="/api/roles" method="POST" redirectTo="/admin/roles" label="Role name" />
      <div className="mt-6">
        <Link
          href="/admin/roles"
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          ← Back to Roles
        </Link>
      </div>
    </div>
  );
}
