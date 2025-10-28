import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import articles from './routes/articles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/assets', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/articles');
});

app.use('/articles', articles);

app.use((req, res) => {
  res.status(404).render('layout', { title: 'Not Found', body: '<p>Not found</p>' });
});

const port = process.env.PORT || 3010;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => console.log('listening on', port));
}

export default app;
