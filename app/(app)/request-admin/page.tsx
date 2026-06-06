import { eq } from "drizzle-orm";

import { RequestAdminButton } from "@/components/RequestAdminButton";
import { accessRequests } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { getIsAdmin, requireAuth } from "@/lib/session";

export default async function RequestAdminPage() {
  const [session, isAdmin] = await Promise.all([requireAuth(), getIsAdmin()]);

  if (isAdmin) {
    return (
      <div className="max-w-sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">You already have admin access.</p>
      </div>
    );
  }

  const existing = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.userId, session.user.id));

  const pending = existing.find((r) => r.status === "pending");
  const approved = existing.find((r) => r.status === "approved");

  return (
    <div className="max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Request Admin Access
      </h1>
      {approved ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          Your request was approved. Please sign out and sign back in to activate admin access.
        </p>
      ) : pending ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your request is pending review by an admin.
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Submit a request to gain admin access. An existing admin will need to approve it.
          </p>
          <RequestAdminButton />
        </>
      )}
    </div>
  );
}
