import { randomBytes } from 'crypto';

export const JWT_SECRET: string = process.env.JWT_SECRET ?? randomBytes(32).toString('hex');
export const JWT_EXPIRES_IN = '2h';

if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET not set. Tokens will be invalidated on server restart.');
}
