import { NextResponse } from "next/server";

import { positions } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { checkIsAdmin, getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await db.select().from(positions);
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  if (!(await checkIsAdmin(request.headers)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const id = crypto.randomUUID();
  await db.insert(positions).values({ id, name: name.trim() });
  return NextResponse.json({ id }, { status: 201 });
}
