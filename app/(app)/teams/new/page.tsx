import { db } from "@/lib/db";
import { teams } from "@/drizzle/schema";
import { TeamForm } from "@/components/TeamForm";

export default async function NewTeamPage() {
  const allTeams = await db.select().from(teams);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Team</h1>
      <TeamForm teams={allTeams} />
    </div>
  );
}
