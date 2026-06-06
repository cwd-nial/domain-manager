import { TeamForm } from "@/components/TeamForm";
import { teams } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function NewTeamPage() {
    await requireAdmin();
    const allTeams = await db.select().from(teams);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Team</h1>
            <TeamForm teams={allTeams} />
        </div>
    );
}
