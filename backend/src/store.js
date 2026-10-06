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
