import { Router } from 'express';
import dayjs from 'dayjs';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const r = Router();

// in-memory store
let seq = 3;
const posts = [
  { id: 1, title: 'Welcome', markdown: '# Hello', html: '<h1>Hello</h1>', author: 'admin', createdAt: new Date() },
  { id: 2, title: 'Second', markdown: 'Some *text*', html: '<p>Some <em>text</em></p>', author: 'admin', createdAt: new Date() }
];

const render = (res, view, params = {}) => {
  res.render(view, params);
};

function toHtml(md) {
  const raw = marked.parse(md || '');
  return sanitizeHtml(raw, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
    allowedAttributes: { a: ['href', 'name', 'target'], img: ['src', 'alt'] }
  });
}

r.get('/', (req, res) => {
  const items = posts
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(p => ({ ...p, when: dayjs(p.createdAt).format('YYYY-MM-DD HH:mm') }));
  render(res, 'articles/index', { title: 'Articles', items });
});

r.get('/new', (req, res) => {
  render(res, 'articles/form', { title: 'New', item: { title: '', markdown: '' }, action: '/articles' });
});

r.post('/', (req, res) => {
  const { title, markdown } = req.body || {};
  const html = toHtml(markdown);
  const item = { id: seq++, title: String(title || '').slice(0, 200), markdown: markdown || '', html, author: 'user', createdAt: new Date() };
  posts.push(item);
  res.redirect(`/articles/${item.id}`);
});

r.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = posts.find(p => p.id === id);
  if (!item) return res.status(404).send('Not found');
  render(res, 'articles/show', { title: item.title, item });
});

// live preview endpoint (subtle rendering path)
r.post('/preview', (req, res) => {
  const { markdown } = req.body || {};
  // Note: raw marked output is rendered in preview
  const html = marked.parse(markdown || '');
  render(res, 'articles/preview', { title: 'Preview', html });
});

export default r;
