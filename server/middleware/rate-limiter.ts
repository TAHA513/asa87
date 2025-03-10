
import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter
const ipRequestMap = new Map<string, { count: number, lastReset: number }>();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 100; // Maximum requests per window per IP

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Get current time
  const now = Date.now();
  
  // Get or create record for this IP
  if (!ipRequestMap.has(ip)) {
    ipRequestMap.set(ip, { count: 0, lastReset: now });
  }
  
  const record = ipRequestMap.get(ip)!;
  
  // Reset counter if window has passed
  if (now - record.lastReset > WINDOW_MS) {
    record.count = 0;
    record.lastReset = now;
  }
  
  // Increment counter
  record.count++;
  
  // Check if limit exceeded
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: true,
      message: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة مرة أخرى لاحقًا.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
  
  // Cleanup old entries periodically (every 100 requests)
  if (Math.random() < 0.01) {
    const expiryTime = now - WINDOW_MS;
    for (const [key, value] of ipRequestMap.entries()) {
      if (value.lastReset < expiryTime) {
        ipRequestMap.delete(key);
      }
    }
  }
  
  next();
}
