"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useNameFormat } from "@/lib/nameFormatContext";
import { formatName, sortKey } from "@/lib/formatName";
import { BadgeGroup } from "@/components/BadgeGroup";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  roleNames: string[];
  positionNames: string[];
};

export function EmployeeListClient({
  employees,
}: {
  employees: Employee[];
}) {
  const [format] = useNameFormat();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(
    () =>
      [...employees].sort((a, b) => {
        const cmp = sortKey(a.firstName, a.lastName, format).localeCompare(
          sortKey(b.firstName, b.lastName, format),
        );
        return sortDir === "asc" ? cmp : -cmp;
      }),
    [employees, format, sortDir],
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <span>Name</span>
                <button
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="text-xs font-normal px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  title={sortDir === "asc" ? "Sorted A → Z" : "Sorted Z → A"}
                >
                  {sortDir === "asc" ? "A→Z" : "Z→A"}
                </button>
              </div>
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
              Email
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
              Roles
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
              Positions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-10 text-center text-gray-400 dark:text-gray-500 italic"
              >
                No employees yet —{" "}
                <Link
                  href="/employees/new"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  add one
                </Link>
              </td>
            </tr>
          ) : (
            sorted.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/employees/${emp.id}`}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {formatName(emp.firstName, emp.lastName, format)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {emp.email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <BadgeGroup items={emp.roleNames} variant="role" />
                </td>
                <td className="px-4 py-3">
                  <BadgeGroup items={emp.positionNames} variant="position" />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
