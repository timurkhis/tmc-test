import express from 'express';
import {add, move, page, readSelected, select, unselect} from './store.js';

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ok: true});
});

app.get('/api/items', (req, res) => {
  const limit = Number(req.query.limit);
  const cursor =
    typeof req.query.cursor === 'string' && req.query.cursor !== ''
      ? req.query.cursor
      : null;
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  res.json(
    page({
      side: req.query.side === 'right' ? 'right' : 'left',
      cursor,
      limit: Number.isInteger(limit) ? limit : 20,
      query,
    }),
  );
});

app.post('/api/selection', (req, res) => {
  res.json(select(req.body.id));
});

app.get('/api/selection', (_req, res) => {
  res.json({items: readSelected()});
});

app.delete('/api/selection/:id', (req, res) => {
  res.json(unselect(req.params.id));
});

app.post('/api/selection/move', (req, res) => {
  res.json(move(req.body.id, req.body.beforeId));
});

app.listen(port, () => {
  console.log(`api listening on ${port}`);
});