"use client";

import { useState } from "react";
import Link from "next/link";
import { teamColorClass } from "@/lib/teamColors";
import { formatName, type NameFormat } from "@/lib/formatName";

export type TreeNode = {
  id: string;
  label: string;
  firstName?: string;
  lastName?: string;
  meta: string[];
  href?: string;
  children: TreeNode[];
  memberEmployees?: { id: string; firstName: string; lastName: string }[];
  teamBadges?: { id: string; name: string }[];
};

function TreeNodeItem({
  node,
  depth = 0,
  nameFormat = "FL",
}: {
  node: TreeNode;
  depth?: number;
  nameFormat?: NameFormat;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  const displayName =
    node.firstName !== undefined
      ? formatName(node.firstName, node.lastName ?? "", nameFormat)
      : node.label;

  return (
    <li>
      <div
        className={`flex items-start gap-1.5 py-1.5 ${depth > 0 ? "pl-4" : ""}`}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-0.5 w-4 h-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xs"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 h-4 flex-shrink-0" />
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {node.href ? (
              <Link
                href={node.href}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
              >
                {displayName}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {displayName}
              </span>
            )}
            {node.teamBadges && node.teamBadges.length > 0 && (
              <>
                {node.teamBadges.map((badge) => (
                  <span
                    key={badge.id}
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${teamColorClass(badge.id)}`}
                  >
                    {badge.name}
                  </span>
                ))}
              </>
            )}
          </div>
          {node.meta.length > 0 && (
            <ul className="flex flex-wrap gap-1 list-none p-0 m-0">
              {node.meta.map((m) => (
                <li
                  key={m}
                  className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <ul className="border-l border-gray-200 dark:border-gray-700 ml-2 list-none p-0">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              nameFormat={nameFormat}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HierarchyTree({
  nodes,
  nameFormat = "FL",
}: {
  nodes: TreeNode[];
  nameFormat?: NameFormat;
}) {
  if (nodes.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No entries
      </p>
    );
  }
  return (
    <ul className="list-none p-0">
      {nodes.map((node) => (
        <TreeNodeItem key={node.id} node={node} nameFormat={nameFormat} />
      ))}
    </ul>
  );
}
