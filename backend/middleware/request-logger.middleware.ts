import type { RequestHandler } from 'express';
import { logger } from '../logger';

function getIp(req: Parameters<RequestHandler>[0]): string {
  const fwd = req.headers['x-forwarded-for'];
  const ip = typeof fwd === 'string' ? (fwd.split(',')[0] ?? fwd) : (req.socket?.remoteAddress ?? 'unknown');
  return ip.trim();
}

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  const ip = getIp(req);

  res.on('finish', () => {
    const ms = Date.now() - start;
    const user = req.jwtUser ?? '-';
    const line = `${user}@${ip}  ${req.method} ${req.path}  →  ${res.statusCode}  ${ms}ms`;

    if (res.statusCode >= 500)      logger.error(line);
    else if (res.statusCode >= 400) logger.warn(line);
    else                            logger.info(line);
  });

  next();
};
