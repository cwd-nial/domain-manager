"use client";

import { useState } from "react";
import Link from "next/link";

export type TreeNode = {
  id: string;
  label: string;
  meta: string[];
  href?: string;
  children: TreeNode[];
};

function TreeNodeItem({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={`flex items-start gap-1.5 py-1.5 ${depth > 0 ? "pl-4" : ""}`}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-0.5 w-4 h-4 flex-shrink-0 text-gray-400 hover:text-gray-600 text-xs"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 h-4 flex-shrink-0" />
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          {node.href ? (
            <Link
              href={node.href}
              className="text-sm font-medium text-blue-600 hover:underline truncate"
            >
              {node.label}
            </Link>
          ) : (
            <span className="text-sm font-medium text-gray-900 truncate">
              {node.label}
            </span>
          )}
          {node.meta.length > 0 && (
            <ul className="flex flex-wrap gap-1 list-none p-0 m-0">
              {node.meta.map((m) => (
                <li
                  key={m}
                  className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <ul className="border-l border-gray-200 ml-2 list-none p-0">
          {node.children.map((child) => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HierarchyTree({ nodes }: { nodes: TreeNode[] }) {
  if (nodes.length === 0) {
    return <p className="text-sm text-gray-400 italic">No entries</p>;
  }
  return (
    <ul className="list-none p-0">
      {nodes.map((node) => (
        <TreeNodeItem key={node.id} node={node} />
      ))}
    </ul>
  );
}
