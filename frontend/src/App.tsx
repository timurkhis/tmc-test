import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Flex } from '@gravity-ui/uikit';
import { AddItemForm } from './components/AddItemForm';
import { ItemColumn } from './components/ItemColumn';
import { useDebounced, usePagedItems } from './hooks/usePagedItems';
import { insertAt, insertOnLeft, type LeftPlace } from './listOrder';

async function postJson(url: string, body: unknown) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export default function App() {
  const [leftQuery, setLeftQuery] = useState('');
  const [rightQuery, setRightQuery] = useState('');
  const leftFilter = useDebounced(leftQuery, 300);
  const left = usePagedItems('left', leftFilter);
  const right = usePagedItems('right', useDebounced(rightQuery, 300));
  const leftPlace = useRef(new Map<string, LeftPlace>());

  useEffect(() => {
    leftPlace.current.clear();
  }, [leftFilter]);

  function placeOnRight(id: string, beforeId: string | null) {
    const fromLeft = !right.items.includes(id);
    const rightFilter = rightQuery.trim();
    const index = left.items.indexOf(id);
    if (index !== -1) {
      leftPlace.current.set(id, {
        prev: left.items[index - 1] ?? null,
        next: left.items[index + 1] ?? null,
      });
    }
    left.setItems((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : items,
    );
    if (rightFilter === '' || id.startsWith(rightFilter)) {
      right.setItems((items) => insertAt(items, id, beforeId));
    }
    void (async () => {
      if (fromLeft) await postJson('/api/selection', { id });
      if (!fromLeft || beforeId !== null) {
        await postJson('/api/selection/move', { id, beforeId });
      }
    })();
  }

  async function addItem(id: string) {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Не удалось добавить');
    const result = (await response.json()) as { ok: boolean };
    if (!result.ok) return false;
    setLeftQuery(id);
    return true;
  }

  function moveToLeft(id: string) {
    const place = leftPlace.current.get(id);
    right.setItems((items) => items.filter((item) => item !== id));
    if (leftFilter === '' || id.startsWith(leftFilter)) {
      left.setItems((items) => insertOnLeft(items, id, place, left.hasMore));
    }
    void fetch(`/api/selection/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  return (
    <Flex
      gap={4}
      style={{ height: '100vh', padding: 16, boxSizing: 'border-box' }}
    >
      <ItemColumn
        title="Все элементы"
        header={<AddItemForm onAdd={addItem} />}
        query={leftQuery}
        items={left.items}
        loading={left.loading}
        error={left.error}
        onLoadMore={left.loadMore}
        onQueryUpdate={setLeftQuery}
        onItemAction={(id) => placeOnRight(id, null)}
        onDropItem={moveToLeft}
      />
      <ItemColumn
        title="Выбранные"
        query={rightQuery}
        items={right.items}
        loading={right.loading}
        error={right.error}
        onLoadMore={right.loadMore}
        onQueryUpdate={setRightQuery}
        onItemAction={moveToLeft}
        onDropItem={placeOnRight}
      />
    </Flex>
  );
}
