const { join } = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const shortid = require('shortid');

const { sqlite } = require('../db');

const router = express.Router();

router.get('/all', async (req, res, next) => {
    try {
        const db = await sqlite;

        const rows = await db.all('SELECT * FROM shortened_urls');

        res.json(rows);
    } catch (e) {
        next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const db = await sqlite;

        if (!req.params.id) throw new Error('No shortened URL specified!');

        const { id } = req.params;
        const row = await db.get('SELECT url FROM shortened_urls WHERE id = ?;', id);

        if (!row) throw new Error(`https://chrismaguilar.com/url-shortener/api/${id} is not a valid shortened URL!`);

        res.redirect(row.url);
    } catch (e) {
        next(e);
    }
});

router.post('/', bodyParser.json(), async (req, res, next) => {
    try {
        const db = await sqlite;

        const id = shortid.generate();
        const { url } = req.body;

        if (!url) throw new Error('No URL specified!');

        await db.run('INSERT INTO shortened_urls (id, url) VALUES (?, ?);', id, url);

        res.json({ id, url });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
