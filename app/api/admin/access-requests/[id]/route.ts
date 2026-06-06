import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { accessRequests, user } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { checkIsAdmin, getSession } from "@/lib/session";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await checkIsAdmin(request.headers)))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const session = await getSession();
    const { id } = await params;
    const { action } = await request.json() as { action: "approve" | "reject" };

    if (action !== "approve" && action !== "reject")
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    const [req] = await db.select().from(accessRequests).where(eq(accessRequests.id, id));
    if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();

    await db
        .update(accessRequests)
        .set({ status: action === "approve" ? "approved" : "rejected", reviewedAt: now, reviewedBy: session!.user.id })
        .where(eq(accessRequests.id, id));

    if (action === "approve") {
        await db.update(user).set({ isAdmin: true }).where(eq(user.id, req.userId));
    }

    return NextResponse.json({ success: true });
}
