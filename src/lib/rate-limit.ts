import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserIdFromToken } from './auth';

// Initialize Redis client for Edge Runtime
const redis = new Redis({
    url: process.env.REDIS_URL || '',
    token: process.env.REDIS_TOKEN || ''
});

// Configure rate limits
const REQUESTS_PER_MINUTE = 60;  // Adjust these values based on your needs
const WINDOW_MS = 60 * 1000;     // 1 minute window

// Configure diary entry limits
const DIARY_ENTRIES_PER_WEEK = 5;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;  // 7 days in milliseconds

// Helper function to increment and check rate limit
async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / windowMs)}`;
    
    try {
        // Increment counter and set expiry atomically using Upstash Redis
        const count = await redis.incr(windowKey);
        // Set expiry only if it's a new key (count === 1)
        if (count === 1) {
            await redis.pexpire(windowKey, windowMs);
        }
        
        return count <= limit;
    } catch (error) {
        console.error('Redis error:', error);
        return true; // Allow request on Redis error rather than blocking users
    }
}

export async function rateLimiter(request: NextRequest) {
    // Get IP address from the request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] || request.headers.get('x-real-ip') || 'anonymous';
    
    const isAllowed = await checkRateLimit(
        `reminiscence:rate-limit:global:ip:${ip}`,
        REQUESTS_PER_MINUTE,
        WINDOW_MS
    );
    
    if (!isAllowed) {
        return NextResponse.json(
            { error: 'Too many requests, please try again later.' },
            { status: 429 }
        );
    }
    
    return null; // Continue with the request
}

export async function diaryEntryLimiter(request: NextRequest) {
    try {
        const token = request.cookies.get('token');
        if (!token) return null; // Let auth middleware handle this case

        const userId = await getUserIdFromToken(token.value);
        
        const isAllowed = await checkRateLimit(
            `reminiscence:rate-limit:diary:user:${userId}`,
            DIARY_ENTRIES_PER_WEEK,
            WEEK_IN_MS
        );
        
        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Weekly diary entry limit reached. Please try again next week.' },
                { status: 429 }
            );
        }
        
        return null; // Continue with the request
    } catch (error) {
        return null; // Let auth middleware handle any token errors
    }
}  