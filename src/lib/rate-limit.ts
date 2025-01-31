import { RateLimiter } from 'limiter';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Create a map to store limiters for different IPs
const ipLimiters = new Map<string, RateLimiter>();

// Configure rate limits
const REQUESTS_PER_MINUTE = 60;  // Adjust these values based on your needs
const WINDOW_MS = 60 * 1000;     // 1 minute window

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

// Clean up old limiters periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, limiter] of ipLimiters.entries()) {
        if (now - limiter.curIntervalStart > WINDOW_MS * 2) {
            ipLimiters.delete(ip);
        }
    }
}, WINDOW_MS); 