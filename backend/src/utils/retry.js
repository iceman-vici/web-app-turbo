const pRetry = require('p-retry');
const { config } = require('../config');
const { logger } = require('./logger');

const defaultRetryOptions = {
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

async function withRetry(fn, options = {}) {
  const mergedOptions = { ...defaultRetryOptions, ...options };
  return pRetry(fn, mergedOptions);
}

async function withExponentialBackoff(fn, maxAttempts = 3) {
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
class CircuitBreaker {
  constructor(
    threshold = 5,
    timeout = 60000,
    resetTimeout = 30000
  ) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.resetTimeout = resetTimeout;
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
  
  async execute(fn) {
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
  
  recordFailure() {
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
  
  reset() {
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

module.exports = {
  withRetry,
  withExponentialBackoff,
  CircuitBreaker,
  defaultRetryOptions
};