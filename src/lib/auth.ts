import jwt from 'jsonwebtoken';

export async function getUserIdFromToken(token: string): Promise<string> {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  try {
    const decoded = jwt.verify(token, secret) as any;
    return decoded.userId as string;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid token');
  }
} 