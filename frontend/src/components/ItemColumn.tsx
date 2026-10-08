import type {DragEvent} from 'react';
import {Card, Flex, Text, TextInput} from '@gravity-ui/uikit';
import {
  unstable_List as List,
  type unstable_ListItemContext as ListItemContext,
  type unstable_ListItemHelpers as ListItemHelpers,
} from '@gravity-ui/uikit/unstable';

type ItemColumnProps = {
  title: string;
  query: string;
  items: string[];
  onQueryUpdate: (value: string) => void;
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

function beforeIdFromPointer(event: DragEvent<HTMLElement>, targetId: string, items: string[]) {
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
  return function renderItem(ctx: ListItemContext<string>, helpers: ListItemHelpers) {
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
  query,
  items,
  onQueryUpdate,
  onItemAction,
  onDropItem,
}: ItemColumnProps) {
  return (
    <Card type="container" view="outlined" style={{flex: 1, minWidth: 0, padding: 16}}>
      <Flex direction="column" gap={3} height="100%">
        <Text variant="subheader-2">{title}</Text>
        <TextInput placeholder="Фильтр по ID" value={query} onUpdate={onQueryUpdate} />
        <List
          aria-label={title}
          items={items}
          style={{flex: 1, minHeight: 0, overflow: 'auto'}}
          onItemAction={onItemAction}
          containerProps={{
            onDragOver: allowDrop,
            onDrop: (event) => {
              const id = readDroppedId(event);
              if (id) onDropItem(id, null);
            },
          }}
          renderItem={renderDraggableItem(items, onDropItem)}
        />
      </Flex>
    </Card>
  );
}
