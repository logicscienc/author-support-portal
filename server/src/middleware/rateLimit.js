
import { rateLimit } from 'express-rate-limit';

// Stops the AI endpoints from being hammered (each call can cost money).
export const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many AI requests. Please wait a minute and try again.' } },
});

// Slows down password guessing: 10 failed logins per 15 minutes per IP.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true, // only failed attempts count
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many failed login attempts. Please try again in 15 minutes.' } },
});