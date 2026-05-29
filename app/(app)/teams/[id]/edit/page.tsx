import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { teams } from "@/drizzle/schema";
import { TeamForm } from "@/components/TeamForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTeamPage({ params }: PageProps) {
  await requireAuth();
  const { id } = await params;

  const [team] = await db.select().from(teams).where(eq(teams.id, id));
  if (!team) notFound();

  const allTeams = await db.select().from(teams);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit — {team.name}</h1>
      <TeamForm
        teams={allTeams}
        defaultValues={{
          id: team.id,
          name: team.name,
          description: team.description ?? "",
          parentId: team.parentId ?? "",
        }}
      />
    </div>
  );
}
