/**
 * Builds an O(1) lookup map from an array of domain objects keyed by id.
 * Used to resolve Notion relation IDs to full objects without repeated
 * linear scans across pages, acts, and venues.
 */
export function buildLookup<T extends { id: string }>(
  items: T[],
): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

/**
 * Resolves an array of Notion relation IDs to full objects using a prebuilt
 * lookup map. IDs with no matching entry are silently dropped — this mirrors
 * Notion's own behavior when a related page is archived or deleted.
 *
 * Preserves the ordering of the input id array.
 */
export function resolveIds<T>(ids: string[], lookup: Map<string, T>): T[] {
  const resolved: T[] = [];
  for (const id of ids) {
    const item = lookup.get(id);
    if (item !== undefined) {
      resolved.push(item);
    }
  }
  return resolved;
}
