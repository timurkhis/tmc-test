import express from 'express';
import {additions, operations} from './queue.js';
import {add, move, page, readSelected, select, unselect} from './store.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ok: true});
});

app.get('/api/items', async (req, res) => {
  const limit = Number(req.query.limit);
  const cursor =
    typeof req.query.cursor === 'string' && req.query.cursor !== ''
      ? req.query.cursor
      : null;
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  const side = req.query.side === 'right' ? 'right' : 'left';
  const size = Number.isInteger(limit) ? limit : 20;
  const result = await operations.enqueue(
    () => page({side, cursor, limit: size, query}),
    {key: `page:${side}:${cursor ?? ''}:${size}:${query}`},
  );
  res.json(result);
});

app.post('/api/items', async (req, res) => {
  const id = String(req.body?.id ?? '').trim();
  const result = await additions.enqueue(() => add(id), {key: `add:${id}`});
  res.status(201).json(result);
});

app.post('/api/selection', async (req, res) => {
  const id = String(req.body?.id ?? '').trim();
  const result = await operations.enqueue(() => select(id), {invalidate: true});
  res.json(result);
});

app.delete('/api/selection/:id', async (req, res) => {
  const id = String(req.params.id ?? '').trim();
  const result = await operations.enqueue(() => unselect(id), {invalidate: true});
  res.json(result);
});

app.post('/api/selection/move', async (req, res) => {
  const id = req.body?.id;
  const beforeId = req.body?.beforeId;
  const result = await operations.enqueue(() => move(id, beforeId), {
    invalidate: true,
  });
  res.json(result);
});

app.get('/api/selection', async (_req, res) => {
  const result = await operations.enqueue(() => ({items: readSelected()}), {
    key: 'selection',
  });
  res.json(result);
});

app.listen(port, () => {
  console.log(`api listening on ${port}`);
});
