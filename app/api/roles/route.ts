import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/drizzle/schema";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await db.select().from(roles);
  return NextResponse.json(all);
}
