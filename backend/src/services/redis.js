const Redis = require('ioredis');
const { config } = require('../config');
const { logger } = require('../utils/logger');

class RedisClient {
  constructor() {
    this.prefix = config.redis.keyPrefix;
    this.client = new Redis(config.redis.url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        logger.error('Redis connection error', { error: err.message });
        return true;
      }
    });
    
    this.client.on('connect', () => {
      logger.info('Redis connected');
    });
    
    this.client.on('error', (err) => {
      logger.error('Redis error', { error: err });
    });
  }
  
  key(key) {
    return `${this.prefix}${key}`;
  }
  
  // Session management
  async createSession(session) {
    const key = this.key(`session:${session.sessionId}`);
    const data = JSON.stringify(session);
    await this.client.setex(key, config.redis.ttl.session, data);
  }
  
  async getSession(sessionId) {
    const key = this.key(`session:${sessionId}`);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async updateSession(sessionId, updates) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const updated = {
      ...session,
      ...updates,
      updatedAt: new Date()
    };
    
    await this.createSession(updated);
  }
  
  async deleteSession(sessionId) {
    const key = this.key(`session:${sessionId}`);
    await this.client.del(key);
  }
  
  // Lock management
  async acquireLock(
    resource,
    ttlMs = config.redis.ttl.lock * 1000
  ) {
    const key = this.key(`lock:${resource}`);
    const token = Math.random().toString(36).substring(2);
    
    const result = await this.client.set(
      key,
      token,
      'PX',
      ttlMs,
      'NX'
    );
    
    return result === 'OK' ? token : null;
  }
  
  async releaseLock(resource, token) {
    const key = this.key(`lock:${resource}`);
    
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await this.client.eval(script, 1, key, token);
    return result === 1;
  }
  
  // Idempotency management
  async checkIdempotency(key) {
    const redisKey = this.key(`idem:${key}`);
    const result = await this.client.setnx(redisKey, '1');
    
    if (result === 1) {
      await this.client.expire(redisKey, config.redis.ttl.idempotency);
      return true;
    }
    
    return false;
  }
  
  async getIdempotencyResult(key) {
    const redisKey = this.key(`idem:result:${key}`);
    const data = await this.client.get(redisKey);
    return data ? JSON.parse(data) : null;
  }
  
  async setIdempotencyResult(key, result) {
    const redisKey = this.key(`idem:result:${key}`);
    await this.client.setex(
      redisKey,
      config.redis.ttl.idempotency,
      JSON.stringify(result)
    );
  }
  
  // Agent session management
  async getAgentSession(agentEmail) {
    const key = this.key(`agent:${agentEmail}`);
    return await this.client.get(key);
  }
  
  async setAgentSession(agentEmail, sessionId) {
    const key = this.key(`agent:${agentEmail}`);
    await this.client.setex(key, config.redis.ttl.session, sessionId);
  }
  
  async deleteAgentSession(agentEmail) {
    const key = this.key(`agent:${agentEmail}`);
    await this.client.del(key);
  }
  
  // Metrics and stats
  async incrementMetric(metric, value = 1) {
    const key = this.key(`metric:${metric}`);
    await this.client.incrby(key, value);
  }
  
  async getMetric(metric) {
    const key = this.key(`metric:${metric}`);
    const value = await this.client.get(key);
    return value ? parseInt(value) : 0;
  }
  
  // Event deduplication
  async isEventProcessed(eventId) {
    const key = this.key(`event:${eventId}`);
    const result = await this.client.setnx(key, '1');
    
    if (result === 1) {
      await this.client.expire(key, 300); // 5 minutes
      return false;
    }
    
    return true;
  }
  
  // Health check
  async ping() {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }
  
  // Cleanup
  async disconnect() {
    await this.client.quit();
  }
  
  // Get the raw client for advanced operations
  getRawClient() {
    return this.client;
  }
}

module.exports = { RedisClient };