-- Up
CREATE TABLE shortened_urls (
    id  TEXT PRIMARY KEY NOT NULL,
    url TEXT NOT NULL
);

-- Down
DROP TABLE shortened_urls;
