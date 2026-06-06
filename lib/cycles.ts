export function wouldCreateCycle(
    entityId: string,
    newParentId: string,
    parentMap: Record<string, string | null>
): boolean {
    let current: string | null = newParentId;
    const visited = new Set<string>();
    while (current !== null && !visited.has(current)) {
        if (current === entityId) return true;
        visited.add(current);
        current = parentMap[current] ?? null;
    }
    return false;
}
