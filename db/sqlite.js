const { join } = require('path');

const sqlite = require('sqlite');

module.exports = sqlite.open(join(__dirname, '..', 'url-shortener.sqlite'));
