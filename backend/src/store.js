const RANGE_END = 1_000_000;
const state = {
  added: [],
  addedSet: new Set(),
  selected: [],
  selectedSet: new Set(),
};

function canonical(id) {
  return String(id ?? '').trim();
}

function inRange(id) {
  return /^[1-9]\d*$/.test(id) && Number(id) <= RANGE_END;
}

export function exists(id) {
  return inRange(id) || state.addedSet.has(id);
}

export function add(rawId) {
  const id = canonical(rawId);
  if (!id || exists(id)) {
    return { ok: false, id };
  }
  state.added.push(id);
  state.addedSet.add(id);
  return { ok: true, id };
}

export function select(rawId) {
  const id = canonical(rawId);
  if (!exists(id) || state.selectedSet.has(id)) {
    return { ok: false, id };
  }
  state.selected.push(id);
  state.selectedSet.add(id);
  return { ok: true, id };
}

export function readSelected() {
  return state.selected;
}

export function unselect(rawId) {
  const id = canonical(rawId);
  const index = state.selected.indexOf(id);
  if (index === -1) return {ok: false, id};
  state.selected.splice(index, 1);
  state.selectedSet.delete(id);
  return {ok: true, id};
}

export function move(rawId, rawBeforeId) {
  const id = canonical(rawId);
  const from = state.selected.indexOf(id);
  if (from === -1) return {ok: false, id};
  const to =
    rawBeforeId == null
      ? state.selected.length
      : state.selected.indexOf(canonical(rawBeforeId));
  if (to === -1) return {ok: false, id};
  if (from === to || from + 1 === to) return {ok: true, id};
  state.selected.splice(from, 1);
  state.selected.splice(from < to ? to - 1 : to, 0, id);
  return {ok: true, id};
}

function pageLeft(cursor, limit) {
  const items = [];
  if (!cursor || inRange(cursor)) {
    let n = cursor ? Number(cursor) + 1 : 1;
    while (n <= RANGE_END && items.length < limit) {
      const id = String(n);
      if (!state.selectedSet.has(id)) items.push(id);
      n += 1;
    }
  }
  if (items.length < limit) {
    let start = 0;
    if (cursor && !inRange(cursor)) {
      const index = state.added.indexOf(cursor);
      start = index === -1 ? state.added.length : index + 1;
    }
    for (let i = start; i < state.added.length && items.length < limit; i += 1) {
      const id = state.added[i];
      if (state.selectedSet.has(id)) continue;
      items.push(id);
    }
  }
  return {
    items,
    nextCursor: items.length === limit ? items[items.length - 1] : null,
  };
}

function pageRight(cursor, limit) {
  let start = 0;
  if (cursor) {
    const index = state.selected.indexOf(cursor);
    start = index === -1 ? state.selected.length : index + 1;
  }
  const items = state.selected.slice(start, start + limit);
  return {
    items,
    nextCursor: items.length === limit ? items[items.length - 1] : null,
  };
}

export function page({side = 'left', cursor = null, limit = 20} = {}) {
  const size = Math.min(Math.max(Number(limit) || 20, 1), 20);
  return side === 'right' ? pageRight(cursor, size) : pageLeft(cursor, size);
}
