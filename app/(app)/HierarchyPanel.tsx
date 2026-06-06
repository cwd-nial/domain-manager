'use client';

import { useState, useMemo } from 'react';

import { HierarchyTree, type TreeNode } from '@/components/HierarchyTree';
import { useNameFormat } from '@/lib/nameFormatContext';

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

function injectEmployeeChildren(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => ({
        ...node,
        children: [
            ...(node.memberEmployees ?? []).map((emp) => ({
                id: `emp-${emp.id}`,
                label: `${emp.firstName} ${emp.lastName}`.trim(),
                firstName: emp.firstName,
                lastName: emp.lastName,
                href: `/employees/${emp.id}`,
                meta: [],
                children: [],
            })),
            ...injectEmployeeChildren(node.children),
        ],
    }));
}

function stripTeamBadges(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => ({
        ...node,
        teamBadges: undefined,
        children: stripTeamBadges(node.children),
    }));
}

export function HierarchyPanel({
    nodes,
    placeholder,
    variant,
}: {
    nodes: TreeNode[];
    placeholder?: string;
    variant: 'team' | 'employee';
}) {
    const [query, setQuery] = useState('');
    const [showEmployees, setShowEmployees] = useState(false);
    const [showTeams, setShowTeams] = useState(false);
    const [nameFormat] = useNameFormat();

    const processed = useMemo(() => {
        let result = filterNodes(nodes, query);
        if (variant === 'team' && showEmployees) {
            result = injectEmployeeChildren(result);
        }
        if (variant === 'employee' && !showTeams) {
            result = stripTeamBadges(result);
        }
        return result;
    }, [nodes, query, variant, showEmployees, showTeams]);

    return (
        <div className="space-y-3">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder ?? 'Search…'}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-teal-500"
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 select-none dark:text-gray-300">
                <input
                    type="checkbox"
                    checked={variant === 'team' ? showEmployees : showTeams}
                    onChange={(e) => {
                        if (variant === 'team') setShowEmployees(e.target.checked);
                        else setShowTeams(e.target.checked);
                    }}
                    className="rounded"
                />
                {variant === 'team' ? 'Show employees' : 'Show teams'}
            </label>
            <div className="max-h-[70vh] overflow-auto">
                <HierarchyTree nodes={processed} nameFormat={nameFormat} />
            </div>
        </div>
    );
}
