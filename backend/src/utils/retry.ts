import pRetry from 'p-retry';
import { config } from '../config';
import { logger } from './logger';

export interface RetryOptions {
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  onFailedAttempt?: (error: pRetry.FailedAttemptError) => void;
}

export const defaultRetryOptions: RetryOptions = {
  retries: 3,
  factor: 2,
  minTimeout: config.policies.network.backoffBaseMs,
  maxTimeout: config.policies.network.backoffMaxMs,
  onFailedAttempt: (error) => {
    logger.warn(`Retry attempt ${error.attemptNumber} failed`, {
      error: error.message,
      retriesLeft: error.retriesLeft
    });
  }
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const mergedOptions = { ...defaultRetryOptions, ...options };
  
  return pRetry(fn, mergedOptions);
}

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let attempt = 0;
  let delay = config.policies.network.backoffBaseMs;
  
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const actualDelay = delay + jitter;
      
      logger.debug(`Backing off for ${actualDelay}ms`, {
        attempt,
        maxAttempts,
        error: error instanceof Error ? error.message : String(error)
      });
      
      await new Promise(resolve => setTimeout(resolve, actualDelay));
      
      // Exponential increase
      delay = Math.min(delay * 2, config.policies.network.backoffMaxMs);
    }
  }
  
  throw new Error(`Failed after ${maxAttempts} attempts`);
}

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000,
    private readonly resetTimeout = 30000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      
      if (this.state === 'half-open') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
      logger.warn('Circuit breaker opened', {
        failures: this.failures,
        threshold: this.threshold
      });
    }
  }
  
  private reset() {
    this.failures = 0;
    this.state = 'closed';
    logger.info('Circuit breaker reset');
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}