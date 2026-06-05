import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const hasSession =
        request.cookies.has("better-auth.session_token") ||
        request.cookies.has("__Secure-better-auth.session_token");

    if (!hasSession) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon\\.ico).*)"],
};
