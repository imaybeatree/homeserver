import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RequestHandler, Request } from 'express';
import { db } from '../db';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../jwt';
import { logger } from '../logger';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

interface RateLimitEntry {
  attempts: number;
  lockedUntil: number | null;
}

const rateLimiter = new Map<string, RateLimitEntry>();

const getPasswordHashQuery = db.prepare(`SELECT value FROM app_config WHERE key = 'password_hash'`);
const setPasswordHashQuery = db.prepare(`
  INSERT INTO app_config (key, value) VALUES ('password_hash', ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value
`);

export function seedPassword() {
  const envPassword = process.env.APP_PASSWORD;
  if (envPassword) {
    const hash = bcrypt.hashSync(envPassword, 12);
    setPasswordHashQuery.run(hash);
    console.log('[auth] Password updated from APP_PASSWORD env var.');
  } else {
    const existing = getPasswordHashQuery.get() as { value: string } | undefined;
    if (!existing) {
      const defaultPassword = 'streaming';
      const hash = bcrypt.hashSync(defaultPassword, 12);
      setPasswordHashQuery.run(hash);
      console.warn(`[auth] No APP_PASSWORD set. Default password: "${defaultPassword}"`);
    }
  }
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return (forwarded.split(',')[0] ?? forwarded).trim();
  return (req.socket?.remoteAddress) ?? 'unknown';
}

function getEntry(ip: string): RateLimitEntry {
  return rateLimiter.get(ip) ?? { attempts: 0, lockedUntil: null };
}

export const loginHandler: RequestHandler = (req, res) => {
  const ip = getClientIp(req);
  const entry = getEntry(ip);

  // Still locked out
  if (entry.lockedUntil !== null && Date.now() < entry.lockedUntil) {
    const remaining = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    logger.warn(`Login blocked — ${ip} is locked out (${remaining}min remaining)`);
    res.status(429).json({ error: 'Too many failed attempts.', lockedUntil: entry.lockedUntil });
    return;
  }

  // Lockout expired — reset
  if (entry.lockedUntil !== null && Date.now() >= entry.lockedUntil) {
    rateLimiter.delete(ip);
  }

  const raw = req.body?.password;
  if (typeof raw !== 'string' || raw.length === 0) {
    res.status(400).json({ error: 'Password is required.' });
    return;
  }

  // Sanitize: strip leading/trailing whitespace, enforce max length, reject non-printable chars
  const password = raw.trim().slice(0, 256).replace(/[^\x20-\x7E]/g, '');
  if (!password) {
    res.status(400).json({ error: 'Password contains invalid characters.' });
    return;
  }

  const row = getPasswordHashQuery.get() as { value: string } | undefined;
  if (!row) {
    res.status(500).json({ error: 'Auth not configured.' });
    return;
  }

  const match = bcrypt.compareSync(password, row.value);

  if (match) {
    rateLimiter.delete(ip);
    logger.auth(`Login success from ${ip}`);
    const token = jwt.sign({ sub: 'app', user: null }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, token });
    return;
  }

  // Failed — record attempt
  const fresh = getEntry(ip);
  const newAttempts = fresh.attempts + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    rateLimiter.set(ip, { attempts: newAttempts, lockedUntil });
    logger.warn(`Login failed from ${ip} — locked out for ${LOCKOUT_DURATION_MS / 60000} minutes after ${MAX_ATTEMPTS} attempts`);
    res.status(429).json({ error: 'Too many failed attempts.', lockedUntil, attemptsLeft: 0 });
    return;
  }

  rateLimiter.set(ip, { attempts: newAttempts, lockedUntil: null });
  logger.warn(`Login failed from ${ip} — ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining`);
  res.status(401).json({ error: 'Incorrect password.', attemptsLeft: MAX_ATTEMPTS - newAttempts });
};

const VALID_USERS = new Set(['mom', 'dad', 'ryan', 'chloe']);

export const meHandler: RequestHandler = (req, res) => {
  const payload = jwt.decode(req.headers.authorization!.slice(7)) as jwt.JwtPayload;
  res.json({ user: payload?.user ?? null });
};

export const selectUserHandler: RequestHandler = (req, res) => {
  const userId = typeof req.body?.userId === 'string' ? req.body.userId.toLowerCase().trim() : '';
  if (!VALID_USERS.has(userId)) {
    res.status(400).json({ error: 'Invalid user.' });
    return;
  }
  const fwd = req.headers['x-forwarded-for'];
  const ip = (typeof fwd === 'string' ? (fwd.split(',')[0] ?? fwd) : (req.socket?.remoteAddress ?? 'unknown')).trim();
  logger.auth(`User "${userId}" signed in from ${ip}`);
  const token = jwt.sign({ sub: 'app', user: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token });
};
