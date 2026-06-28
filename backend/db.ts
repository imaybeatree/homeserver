import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

const dataDir = process.env.SQLITE_DATA_DIR || path.resolve(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "homeapp.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS saved_shows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    media_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title TEXT NOT NULL,
    overview TEXT NOT NULL DEFAULT '',
    poster_path TEXT,
    backdrop_path TEXT,
    genre_ids TEXT NOT NULL DEFAULT '[]',
    release_date TEXT,
    first_air_date TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, media_id, media_type)
  );
`);

try { db.exec(`ALTER TABLE saved_shows ADD COLUMN last_season TEXT`); } catch {}
try { db.exec(`ALTER TABLE saved_shows ADD COLUMN last_episode TEXT`); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);
