"use client";

import { useState, useMemo } from "react";
import { HierarchyTree, type TreeNode } from "@/components/HierarchyTree";

function filterNodes(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  return nodes.reduce<TreeNode[]>((acc, node) => {
    const filteredChildren = filterNodes(node.children, query);
    if (node.label.toLowerCase().includes(q) || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren });
    }
    return acc;
  }, []);
}

export function HierarchyPanel({
  nodes,
  placeholder,
}: {
  nodes: TreeNode[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterNodes(nodes, query), [nodes, query]);

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? "Search…"}
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="overflow-auto max-h-[70vh]">
        <HierarchyTree nodes={filtered} />
      </div>
    </div>
  );
}
