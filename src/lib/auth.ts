import { jwtVerify } from 'jose';

export async function getUserIdFromToken(token: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.userId as string;
} 