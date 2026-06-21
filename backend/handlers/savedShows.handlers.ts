import { authenticated } from "./request.handlers";
import { db } from "../db";

const USERS = new Set(["mom", "dad", "ryan", "chloe"]);
const MEDIA_TYPES = new Set(["movie", "tv"]);

const savedShowsQuery = db.prepare(`
  SELECT
    media_id,
    media_type,
    title,
    overview,
    poster_path,
    backdrop_path,
    genre_ids,
    release_date,
    first_air_date,
    last_season,
    last_episode
  FROM saved_shows
  WHERE user_id = ?
  ORDER BY datetime(created_at) DESC
`);

const isSavedQuery = db.prepare(`
  SELECT id FROM saved_shows
  WHERE user_id = ? AND media_id = ? AND media_type = ?
`);

const saveShowQuery = db.prepare(`
  INSERT INTO saved_shows (
    user_id,
    media_id,
    media_type,
    title,
    overview,
    poster_path,
    backdrop_path,
    genre_ids,
    release_date,
    first_air_date
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id, media_id, media_type) DO UPDATE SET
    title = excluded.title,
    overview = excluded.overview,
    poster_path = excluded.poster_path,
    backdrop_path = excluded.backdrop_path,
    genre_ids = excluded.genre_ids,
    release_date = excluded.release_date,
    first_air_date = excluded.first_air_date
`);

const removeShowQuery = db.prepare(`
  DELETE FROM saved_shows
  WHERE user_id = ? AND media_id = ? AND media_type = ?
`);

const updateProgressQuery = db.prepare(`
  UPDATE saved_shows
  SET last_season = ?, last_episode = ?
  WHERE user_id = ? AND media_id = ? AND media_type = ?
`);

type SavedShowRow = {
  media_id: number;
  media_type: "movie" | "tv";
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: string;
  release_date: string | null;
  first_air_date: string | null;
  last_season: string | null;
  last_episode: string | null;
};

function isValidUser(userId: string) {
  return USERS.has(userId.toLowerCase());
}

function parseGenreIds(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

function formatSavedShow(row: SavedShowRow) {
  const base = {
    id: row.media_id,
    adult: false,
    genre_ids: parseGenreIds(row.genre_ids),
    original_language: "",
    overview: row.overview,
    popularity: 0,
    poster_path: row.poster_path,
    backdrop_path: row.backdrop_path,
    vote_average: 0,
    vote_count: 0,
    video: false,
  };

  if (row.media_type === "movie") {
    return {
      ...base,
      media_type: "movie",
      original_title: row.title,
      release_date: row.release_date || "",
      title: row.title,
    };
  }

  return {
    ...base,
    media_type: "tv",
    original_name: row.title,
    first_air_date: row.first_air_date || "",
    name: row.title,
    last_season: row.last_season ?? undefined,
    last_episode: row.last_episode ?? undefined,
  };
}

export const savedShowsHandler = authenticated(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Missing user" });
  }

  const normalizedUserId = userId.toLowerCase();

  if (!isValidUser(normalizedUserId)) {
    return res.status(400).json({ error: "Unknown user" });
  }

  const rows = savedShowsQuery.all(normalizedUserId) as SavedShowRow[];
  res.json({ results: rows.map(formatSavedShow) });
});

export const saveShowHandler = authenticated(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "Missing user" });
  }

  const normalizedUserId = userId.toLowerCase();
  const media = req.body;

  if (!isValidUser(normalizedUserId)) {
    return res.status(400).json({ error: "Unknown user" });
  }

  if (!media || !MEDIA_TYPES.has(media.media_type) || !Number.isInteger(media.id)) {
    return res.status(400).json({ error: "Invalid media" });
  }

  const title = media.media_type === "movie" ? media.title : media.name;
  if (!title) {
    return res.status(400).json({ error: "Missing title" });
  }

  saveShowQuery.run(
    normalizedUserId,
    media.id,
    media.media_type,
    title,
    media.overview || "",
    media.poster_path || null,
    media.backdrop_path || null,
    JSON.stringify(Array.isArray(media.genre_ids) ? media.genre_ids : []),
    media.media_type === "movie" ? media.release_date || "" : "",
    media.media_type === "tv" ? media.first_air_date || "" : "",
  );

  res.status(201).json({ saved: true });
});

export const removeSavedShowHandler = authenticated(async (req, res) => {
  const { userId, mediaType, mediaId } = req.params;
  if (!userId || !mediaType || !mediaId) {
    return res.status(400).json({ error: "Missing media" });
  }

  const normalizedUserId = userId.toLowerCase();
  const parsedMediaId = Number(mediaId);

  if (!isValidUser(normalizedUserId)) {
    return res.status(400).json({ error: "Unknown user" });
  }

  if (!MEDIA_TYPES.has(mediaType) || !Number.isInteger(parsedMediaId)) {
    return res.status(400).json({ error: "Invalid media" });
  }

  removeShowQuery.run(normalizedUserId, parsedMediaId, mediaType);
  res.json({ saved: false });
});

export function isShowSaved(userId: string, mediaId: number, mediaType: string) {
  return Boolean(isSavedQuery.get(userId, mediaId, mediaType));
}

export const updateProgressHandler = authenticated(async (req, res) => {
  const { userId, mediaType, mediaId } = req.params;
  if (!userId || !mediaType || !mediaId) {
    return res.status(400).json({ error: "Missing params" });
  }

  const normalizedUserId = userId.toLowerCase();
  const parsedMediaId = Number(mediaId);

  if (!isValidUser(normalizedUserId)) {
    return res.status(400).json({ error: "Unknown user" });
  }

  if (!MEDIA_TYPES.has(mediaType) || !Number.isInteger(parsedMediaId)) {
    return res.status(400).json({ error: "Invalid media" });
  }

  const { season, episode } = req.body;
  if (typeof season !== "string" || typeof episode !== "string") {
    return res.status(400).json({ error: "Invalid season or episode" });
  }

  updateProgressQuery.run(season, episode, normalizedUserId, parsedMediaId, mediaType);
  res.json({ updated: true });
});
