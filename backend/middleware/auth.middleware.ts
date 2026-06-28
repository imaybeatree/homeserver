import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../jwt';

declare global {
  namespace Express {
    interface Request {
      jwtUser?: string | null;
    }
  }
}

export const verifyToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    req.jwtUser = typeof payload.user === 'string' ? payload.user : null;
    const refreshed = jwt.sign(
      { sub: payload.sub, user: payload.user ?? null },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    res.setHeader('X-Refresh-Token', refreshed);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
