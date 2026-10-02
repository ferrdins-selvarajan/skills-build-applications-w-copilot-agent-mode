import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters');
  }
  return secret;
}

export function validateJwtConfiguration(): void {
  getJwtSecret();
}

export function createAccessToken(userId: string): string {
  return jwt.sign({}, getJwtSecret(), { subject: userId, expiresIn: '7d' });
}

export const authenticate: RequestHandler = (request, response, next) => {
  const authorization = request.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : undefined;

  if (!token) {
    response.status(401).json({ error: 'A bearer token is required' });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (typeof payload === 'string' || !payload.sub) {
      response.status(401).json({ error: 'Invalid access token' });
      return;
    }
    request.userId = payload.sub;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      response.status(401).json({ error: 'Invalid or expired access token' });
      return;
    }
    next(error);
  }
};
