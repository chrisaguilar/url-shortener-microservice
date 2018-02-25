const { join } = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const sqlite = require('sqlite').open(join(__dirname, 'shortened-urls.sqlite'));
const shortid = require('shortid');

const asyncM = fn => (req, res, next) => fn(req, res, next).catch(next);

const app = express();

app.set('port', parseInt(process.env.PORT, 10));

app.get('/api/all', asyncM(async (req, res) => {
    const db = await sqlite;

    const rows = [...(await db.all('SELECT * FROM shortened_urls'))];

    res.json(rows);
}));

app.get('/api/:id', asyncM(async (req, res) => {
    const db = await sqlite;

    if (!req.params.id) throw new Error('No shortened URL specified!');

    const { id } = req.params;
    const row = await db.get('SELECT url FROM shortened_urls WHERE id = ?;', id);

    if (!row) throw new Error(`https://chrismaguilar.com/url-shortener/api/${id} is not a valid shortened URL!`)

    res.redirect(row.url);
}));

app.post('/api', bodyParser.json(), asyncM(async (req, res) => {
    const db = await sqlite;

    const id = shortid.generate();
    const { url } = req.body;

    if (!url) throw new Error('No URL specified!');

    await db.run('INSERT INTO shortened_urls (id, url) VALUES (?, ?);', id, url);

    res.json({ id, url });
}));

app.get('*', (req, res) => res.sendFile(join(__dirname, 'index.html')));

app.use((err, req, res, next) => res.send(err.message));

app.listen(app.get('port'), async () => {
    console.log(`/url-shortener listening on port ${app.get('port')}`);

    try {
        const db = await sqlite;
        db.migrate({ migrationsPath: join(__dirname, 'migrations') });
    } catch (e) {
        console.errror(e);
        process.exit(1);
    }
})
