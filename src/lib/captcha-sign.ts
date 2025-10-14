import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = (process.env.CAPTCHA_SECRET || 'dev-secret').toString();

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Firma un texto y devuelve un token compacto payload.sig (base64url).
 */
export function sign(text: string): string {
  const payload = String(text || '').trim();
  const h = createHmac('sha256', SECRET).update(payload).digest();
  return `${b64url(payload)}.${b64url(h)}`;
}

/**
 * Verifica que el token corresponda al texto suministrado.
 */
export function verify(token: string | undefined | null, text: string | undefined | null): boolean {
  if (!token || !text) return false;
  const [p, sig] = String(token).split('.', 2);
  if (!p || !sig) return false;
  const payload = Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(`${p}.${sig}`)) && payload === String(text).trim();
  } catch {
    return false;
  }
}

