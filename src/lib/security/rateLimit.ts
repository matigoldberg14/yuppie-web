// src/lib/security/rateLimit.ts
import { RATE_LIMIT_CONFIG } from './config'; // Añadimos esta importación

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private blockedIPs: Set<string> = new Set();
  private blockTimers: Map<string, NodeJS.Timeout> = new Map();

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  checkLimit(ip: string): boolean {
    if (this.isBlocked(ip)) return false;

    const now = Date.now();
    const userRequests = this.requests.get(ip) || [];
    const recentRequests = userRequests.filter(
      (time) => now - time < RATE_LIMIT_CONFIG.WINDOW_MS
    );

    if (recentRequests.length >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
      this.blockIP(ip);
      return false;
    }

    recentRequests.push(now);
    this.requests.set(ip, recentRequests);
    return true;
  }

  private blockIP(ip: string) {
    this.blockedIPs.add(ip);
    const timer = setTimeout(() => {
      this.blockedIPs.delete(ip);
      this.blockTimers.delete(ip);
    }, RATE_LIMIT_CONFIG.BLOCK_DURATION);
    this.blockTimers.set(ip, timer);
  }

  clearBlockTimer(ip: string) {
    const timer = this.blockTimers.get(ip);
    if (timer) {
      clearTimeout(timer);
      this.blockTimers.delete(ip);
    }
  }
}

export const rateLimiter = new RateLimiter();
