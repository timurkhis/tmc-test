import {
  useEffect,
  useRef,
  type DragEvent,
  type ReactNode,
  type UIEvent,
} from 'react';
import { Card, Flex, Spin, Text, TextInput } from '@gravity-ui/uikit';
import {
  unstable_List as List,
  type unstable_ListItemContext as ListItemContext,
  type unstable_ListItemHelpers as ListItemHelpers,
} from '@gravity-ui/uikit/unstable';

type ItemColumnProps = {
  title: string;
  header?: ReactNode;
  query: string;
  items: string[];
  onQueryUpdate: (value: string) => void;
  loading: boolean;
  error: string | null;
  onLoadMore: () => void;
  onItemAction: (id: string) => void;
  onDropItem: (id: string, beforeId: string | null) => void;
};

function allowDrop(event: DragEvent) {
  event.preventDefault();
}

function readDroppedId(event: DragEvent) {
  event.preventDefault();
  return event.dataTransfer.getData('text/plain');
}

function beforeIdFromPointer(
  event: DragEvent<HTMLElement>,
  targetId: string,
  items: string[],
) {
  const rect = event.currentTarget.getBoundingClientRect();
  const after = event.clientY >= rect.top + rect.height / 2;
  if (!after) return targetId;
  const index = items.indexOf(targetId);
  if (index === -1 || index >= items.length - 1) return null;
  return items[index + 1];
}

function renderDraggableItem(
  items: string[],
  onDropItem: (id: string, beforeId: string | null) => void,
) {
  return function renderItem(
    ctx: ListItemContext<string>,
    helpers: ListItemHelpers,
  ) {
    return (
      <List.ItemView
        {...helpers.getItemProps({
          ref: (element) => {
            element?.setAttribute('draggable', 'true');
          },
          onDragStart: (event) => {
            event.dataTransfer.setData('text/plain', ctx.item);
            event.dataTransfer.effectAllowed = 'move';
          },
          onDragOver: (event) => {
            event.preventDefault();
            event.stopPropagation();
          },
          onDrop: (event) => {
            event.preventDefault();
            event.stopPropagation();
            const id = event.dataTransfer.getData('text/plain');
            if (!id || id === ctx.item) return;
            onDropItem(id, beforeIdFromPointer(event, ctx.item, items));
          },
        })}
        {...helpers.getItemViewProps()}
      >
        {ctx.content}
      </List.ItemView>
    );
  };
}

export function ItemColumn({
  title,
  header,
  query,
  items,
  loading,
  error,
  onLoadMore,
  onQueryUpdate,
  onItemAction,
  onDropItem,
}: ItemColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root || loading || items.length === 0) return;
    const lastItem = root.querySelector<HTMLElement>(
      '[role="option"]:last-of-type',
    );
    if (!lastItem) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { root, rootMargin: '48px' },
    );
    observer.observe(lastItem);
    return () => observer.disconnect();
  }, [items, loading, onLoadMore]);

  function loadMoreOnScroll(event: UIEvent<HTMLElement>) {
    const element = event.currentTarget;
    const remaining =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    if (remaining < 48) onLoadMore();
  }

  return (
    <Card
      type="container"
      view="outlined"
      style={{ flex: 1, minWidth: 0, padding: 16 }}
    >
      <Flex direction="column" gap={3} height="100%">
        <Text variant="subheader-2">{title}</Text>
        {header}
        <TextInput
          placeholder="Фильтр по ID"
          value={query}
          onUpdate={onQueryUpdate}
        />
        <List
          ref={listRef}
          aria-label={title}
          items={items}
          style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
          onItemAction={onItemAction}
          containerProps={{
            onScroll: loadMoreOnScroll,
            onDragOver: allowDrop,
            onDrop: (event) => {
              const id = readDroppedId(event);
              if (id) onDropItem(id, null);
            },
          }}
          renderItem={renderDraggableItem(items, onDropItem)}
        />
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Spin size="s" />
          </div>
        ) : null}
        {error ? <Text color="danger">{error}</Text> : null}
      </Flex>
    </Card>
  );
}
