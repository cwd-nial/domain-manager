"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function NavShell() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: "Home" },
    { href: "/employees", label: "Employees" },
    { href: "/teams", label: "Teams" },
  ];

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <span className="font-semibold text-gray-900 mr-2">
            Domain Manager
          </span>
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm ${active ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
