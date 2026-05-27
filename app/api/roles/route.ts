import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/drizzle/schema";

export async function GET() {
  const all = await db.select().from(roles);
  return NextResponse.json(all);
}
