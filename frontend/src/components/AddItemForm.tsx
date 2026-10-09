import { useState } from 'react';
import { Button, Flex, Text, TextInput } from '@gravity-ui/uikit';

type AddItemFormProps = {
  onAdd: (id: string) => Promise<boolean>;
};

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const id = value.trim();
    if (!id || pending) return;
    setPending(true);
    setError(null);
    try {
      const ok = await onAdd(id);
      if (ok) setValue('');
      else setError('Такой ID уже есть');
    } catch {
      setError('Не удалось добавить');
    } finally {
      setPending(false);
    }
  }

  return (
    <Flex direction="column" gap={2}>
      <Flex gap={2}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextInput
            placeholder="Новый ID"
            value={value}
            disabled={pending}
            onUpdate={setValue}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submit();
            }}
          />
        </div>
        <Button
          view="action"
          loading={pending}
          disabled={value.trim() === ''}
          onClick={() => void submit()}
        >
          Добавить
        </Button>
      </Flex>
      {error ? <Text color="danger">{error}</Text> : null}
    </Flex>
  );
}
