import {useState} from 'react';
import './App.css';
import {Flex} from '@gravity-ui/uikit';
import {ItemColumn} from './components/ItemColumn';

const loadedLeft = Array.from({length: 40}, (_, index) => String(index + 1));

function insertAt(items: string[], id: string, beforeId: string | null) {
  const from = items.indexOf(id);
  const next = from === -1 ? items.slice() : items.filter((item) => item !== id);
  const index = beforeId == null ? next.length : next.indexOf(beforeId);
  const insertIndex = index === -1 ? next.length : index;
  if (from !== -1 && insertIndex === from) return items;
  next.splice(insertIndex, 0, id);
  return next;
}

export default function App() {
  const [leftQuery, setLeftQuery] = useState('');
  const [rightQuery, setRightQuery] = useState('');
  const [leftItems, setLeftItems] = useState(loadedLeft);
  const [rightItems, setRightItems] = useState<string[]>([]);

  function placeOnRight(id: string, beforeId: string | null) {
    setLeftItems((items) => items.filter((item) => item !== id));
    setRightItems((items) => insertAt(items, id, beforeId));
  }

  function moveToLeft(id: string) {
    setRightItems((items) => items.filter((item) => item !== id));
    setLeftItems((items) => (items.includes(id) ? items : [id, ...items]));
  }

  return (
    <Flex gap={4} style={{height: '100vh', padding: 16, boxSizing: 'border-box'}}>
      <ItemColumn
        title="Все элементы"
        query={leftQuery}
        items={leftItems}
        onQueryUpdate={setLeftQuery}
        onItemAction={(id) => placeOnRight(id, null)}
        onDropItem={(_id) => moveToLeft(_id)}
      />
      <ItemColumn
        title="Выбранные"
        query={rightQuery}
        items={rightItems}
        onQueryUpdate={setRightQuery}
        onItemAction={moveToLeft}
        onDropItem={placeOnRight}
      />
    </Flex>
  );
}
