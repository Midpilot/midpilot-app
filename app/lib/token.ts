import crypto from 'crypto';

const SECRET = process.env.RATE_LIMIT_SECRET;
if (!SECRET) throw new Error('SECRET not set in .env');

interface Payload { attempts: number; ts: number; }

export const createToken = (attempts: number): string => {
  const payload = JSON.stringify({ attempts, ts: Date.now() });
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64');
};

export const verifyToken = (token: string): Payload | null => {
  try {
    const [payload, sig] = Buffer.from(token, 'base64').toString().split(/\.(.+)/);
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
      ? JSON.parse(payload)
      : null;
  } catch {
    return null;
  }
};

