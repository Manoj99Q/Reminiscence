import { RateLimiter } from 'limiter';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserIdFromToken } from './auth';

// Create a map to store limiters for different IPs
const ipLimiters = new Map<string, RateLimiter>();

// Create a map to store limiters for diary entries per user
const userDiaryLimiters = new Map<string, RateLimiter>();

// Configure rate limits
const REQUESTS_PER_MINUTE = 60;  // Adjust these values based on your needs
const WINDOW_MS = 60 * 1000;     // 1 minute window


// Configure diary entry limits
const DIARY_ENTRIES_PER_WEEK = 5;
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;  // 7 days in milliseconds

export async function rateLimiter(request: NextRequest) {
    // Get IP address from the request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0] || request.headers.get('x-real-ip') || 'anonymous';
    
    // Get or create limiter for this IP
    if (!ipLimiters.has(ip)) {
        ipLimiters.set(ip, new RateLimiter({
            tokensPerInterval: REQUESTS_PER_MINUTE,
            interval: WINDOW_MS,
            fireImmediately: true
        }));
    }
    
    const limiter = ipLimiters.get(ip)!;
    const hasToken = await limiter.tryRemoveTokens(1);
    
    if (!hasToken) {
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
        
        // Get or create limiter for this user
        if (!userDiaryLimiters.has(userId)) {
            userDiaryLimiters.set(userId, new RateLimiter({
                tokensPerInterval: DIARY_ENTRIES_PER_WEEK,
                interval: WEEK_IN_MS,
                fireImmediately: true
            }));
        }
        
        const limiter = userDiaryLimiters.get(userId)!;
        const hasToken = await limiter.tryRemoveTokens(1);
        
        if (!hasToken) {
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

// Clean up old limiters periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, limiter] of ipLimiters.entries()) {
        if (now - limiter.curIntervalStart > WINDOW_MS * 2) {
            ipLimiters.delete(ip);
        }
    }
    for (const [userId, limiter] of userDiaryLimiters.entries()) {
        if (now - limiter.curIntervalStart > WEEK_IN_MS * 2) {
            userDiaryLimiters.delete(userId);
        }
    }
}, WINDOW_MS);  