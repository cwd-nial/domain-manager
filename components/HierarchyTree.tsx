'use client';

import Link from 'next/link';
import { useState } from 'react';

import { formatName, type NameFormat } from '@/lib/formatName';
import { teamColorClass } from '@/lib/teamColors';

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
    nameFormat = 'FL',
}: {
    node: TreeNode;
    depth?: number;
    nameFormat?: NameFormat;
}) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children.length > 0;

    const displayName =
        node.firstName !== undefined ? formatName(node.firstName, node.lastName ?? '', nameFormat) : node.label;

    return (
        <li>
            <div className={`flex items-start gap-1.5 py-1.5 ${depth > 0 ? 'pl-4' : ''}`}>
                {hasChildren ? (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                        {expanded ? '▾' : '▸'}
                    </button>
                ) : (
                    <span className="h-4 w-4 flex-shrink-0" />
                )}
                <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {node.href ? (
                            <Link
                                href={node.href}
                                className="truncate text-sm font-medium text-blue-600 hover:underline dark:text-teal-400"
                            >
                                {displayName}
                            </Link>
                        ) : (
                            <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                {displayName}
                            </span>
                        )}
                        {node.teamBadges && node.teamBadges.length > 0 && (
                            <>
                                {node.teamBadges.map((badge) => (
                                    <span
                                        key={badge.id}
                                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${teamColorClass(badge.id)}`}
                                    >
                                        {badge.name}
                                    </span>
                                ))}
                            </>
                        )}
                    </div>
                    {node.meta.length > 0 && (
                        <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
                            {node.meta.map((m) => (
                                <li
                                    key={m}
                                    className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                >
                                    {m}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {hasChildren && expanded && (
                <ul className="ml-2 list-none border-l border-gray-200 p-0 dark:border-gray-700">
                    {node.children.map((child) => (
                        <TreeNodeItem key={child.id} node={child} depth={depth + 1} nameFormat={nameFormat} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export function HierarchyTree({ nodes, nameFormat = 'FL' }: { nodes: TreeNode[]; nameFormat?: NameFormat }) {
    if (nodes.length === 0) {
        return <p className="text-sm text-gray-400 italic dark:text-gray-500">No entries</p>;
    }
    return (
        <ul className="list-none p-0">
            {nodes.map((node) => (
                <TreeNodeItem key={node.id} node={node} nameFormat={nameFormat} />
            ))}
        </ul>
    );
}
