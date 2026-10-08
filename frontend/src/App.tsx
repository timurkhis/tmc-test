import {useState} from 'react';
import './App.css';
import {Flex} from '@gravity-ui/uikit';
import {ItemColumn} from './components/ItemColumn';

const loadedLeft = Array.from({length: 40}, (_, index) => String(index + 1));

export default function App() {
  const [leftQuery, setLeftQuery] = useState('');
  const [rightQuery, setRightQuery] = useState('');
  const [leftItems, setLeftItems] = useState(loadedLeft);
  const [rightItems, setRightItems] = useState<string[]>([]);

  function moveToRight(id: string) {
    setLeftItems((items) => items.filter((item) => item !== id));
    setRightItems((items) => (items.includes(id) ? items : [...items, id]));
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
        onItemAction={moveToRight}
        onDropItem={moveToLeft}
      />
      <ItemColumn
        title="Выбранные"
        query={rightQuery}
        items={rightItems}
        onQueryUpdate={setRightQuery}
        onItemAction={moveToLeft}
        onDropItem={moveToRight}
      />
    </Flex>
  );
}
