export type LeftPlace = { prev: string | null; next: string | null };

const rangeEnd = 1_000_000;

function inRange(id: string) {
  return /^[1-9]\d*$/.test(id) && Number(id) <= rangeEnd;
}

function indexByNeighbor(items: string[], place: LeftPlace | undefined) {
  if (!place) return -1;
  if (place.next !== null) {
    const index = items.indexOf(place.next);
    if (index !== -1) return index;
  }
  if (place.prev !== null) {
    const index = items.indexOf(place.prev);
    if (index !== -1) return index + 1;
  }
  return place.prev === null && place.next === null ? 0 : -1;
}

export function insertOnLeft(
  items: string[],
  id: string,
  place: LeftPlace | undefined,
  hasMore: boolean,
) {
  if (items.includes(id)) return items;
  const index = inRange(id)
    ? items.findIndex((item) => !inRange(item) || Number(item) > Number(id))
    : indexByNeighbor(items, place);
  if (index === -1) return hasMore ? items : [...items, id];
  return [...items.slice(0, index), id, ...items.slice(index)];
}

export function insertAt(items: string[], id: string, beforeId: string | null) {
  const from = items.indexOf(id);
  const next =
    from === -1 ? items.slice() : items.filter((item) => item !== id);
  const index = beforeId == null ? next.length : next.indexOf(beforeId);
  const insertIndex = index === -1 ? next.length : index;
  if (from !== -1 && insertIndex === from) return items;
  next.splice(insertIndex, 0, id);
  return next;
}
