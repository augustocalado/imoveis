export function normalizeNeighborhoodList(rawList: (string | null | undefined)[]): { unique: string[], mapToRaw: Record<string, string[]> } {
    const mapToRaw: Record<string, Set<string>> = {};
    const normalizedSet = new Set<string>();

    rawList.forEach((raw) => {
        if (!raw) return;
        const rawStr = raw.toString();
        const trimmed = rawStr.trim();
        if (!trimmed) return;

        // Capitalize each word properly (e.g. "caiçara" -> "Caiçara", "vila caiçara" -> "Vila Caiçara")
        const normalized = trimmed
            .toLowerCase()
            .split(/\s+/)
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
            .join(' ');

        normalizedSet.add(normalized);
        if (!mapToRaw[normalized]) {
            mapToRaw[normalized] = new Set();
        }
        mapToRaw[normalized].add(rawStr);
        mapToRaw[normalized].add(trimmed);
        mapToRaw[normalized].add(trimmed.toLowerCase());
        mapToRaw[normalized].add(trimmed.toUpperCase());
    });

    const unique = Array.from(normalizedSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const finalMap: Record<string, string[]> = {};
    for (const key of unique) {
        finalMap[key] = Array.from(mapToRaw[key]);
    }

    return { unique, mapToRaw: finalMap };
}

export function getRawNeighborhoodVariants(selectedList: string[], mapToRaw?: Record<string, string[]>): string[] {
    if (!selectedList || selectedList.length === 0) return [];
    const set = new Set<string>();
    selectedList.forEach(name => {
        set.add(name);
        set.add(name.trim());
        set.add(name.toLowerCase());
        set.add(name.toUpperCase());
        if (mapToRaw && mapToRaw[name]) {
            mapToRaw[name].forEach(v => set.add(v));
        }
    });
    return Array.from(set);
}
