import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { positions } from "@/drizzle/schema";

export async function GET() {
  const all = await db.select().from(positions);
  return NextResponse.json(all);
}
