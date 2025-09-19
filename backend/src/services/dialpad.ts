import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { withRetry } from '../utils/retry';
import crypto from 'crypto';

export class DialpadService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: config.dialpad.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.dialpad.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: config.policies.network.timeoutMs
    });
    
    // Add request/response logging
    this.client.interceptors.request.use(
      (req) => {
        logger.debug('Dialpad API request', {
          method: req.method,
          url: req.url,
          data: req.data
        });
        return req;
      },
      (error) => {
        logger.error('Dialpad API request error', { error });
        return Promise.reject(error);
      }
    );
    
    this.client.interceptors.response.use(
      (res) => {
        logger.debug('Dialpad API response', {
          status: res.status,
          data: res.data
        });
        return res;
      },
      (error) => {
        logger.error('Dialpad API response error', {
          status: error.response?.status,
          data: error.response?.data,
          error: error.message
        });
        return Promise.reject(error);
      }
    );
  }
  
  // Initiate a call
  async initiateCall(
    userId: string,
    phoneNumber: string,
    customData: any
  ): Promise<{ callId: string }> {
    try {
      const response = await withRetry(() =>
        this.client.post('/calls', {
          user_id: userId,
          phone_number: phoneNumber,
          custom_data: customData,
          call_type: 'outbound'
        })
      );
      
      logger.info('Call initiated', {
        userId,
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        callId: response.data.call_id
      });
      
      return { callId: response.data.call_id };
    } catch (error) {
      logger.error('Failed to initiate call', {
        userId,
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        error
      });
      throw error;
    }
  }
  
  // Get call details
  async getCallDetails(callId: string): Promise<any> {
    try {
      const response = await withRetry(() =>
        this.client.get(`/calls/${callId}`)
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get call details', { callId, error });
      throw error;
    }
  }
  
  // End a call
  async endCall(callId: string): Promise<boolean> {
    try {
      await withRetry(() =>
        this.client.post(`/calls/${callId}/end`)
      );
      
      logger.info('Call ended', { callId });
      return true;
    } catch (error) {
      logger.error('Failed to end call', { callId, error });
      return false;
    }
  }
  
  // Verify webhook signature
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    if (!config.dialpad.webhookSecret) {
      logger.warn('Webhook secret not configured, skipping verification');
      return true;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', config.dialpad.webhookSecret)
      .update(payload)
      .digest('hex');
    
    const isValid = signature === expectedSignature;
    
    if (!isValid) {
      logger.warn('Invalid webhook signature');
    }
    
    return isValid;
  }
  
  // Parse webhook event
  parseWebhookEvent(body: any): {
    eventId: string;
    event: string;
    callId: string;
    customData?: any;
    timestamp: Date;
  } {
    return {
      eventId: body.event_id || crypto.randomUUID(),
      event: body.event,
      callId: body.call_id,
      customData: body.custom_data,
      timestamp: new Date(body.timestamp || Date.now())
    };
  }
  
  // Helper to mask phone number for logging
  private maskPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber || phoneNumber.length < 4) {
      return '****';
    }
    return `****${phoneNumber.slice(-4)}`;
  }
  
  // Get user details
  async getUserDetails(userId: string): Promise<any> {
    try {
      const response = await withRetry(() =>
        this.client.get(`/users/${userId}`)
      );
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get user details', { userId, error });
      throw error;
    }
  }
  
  // Check if user is available
  async isUserAvailable(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserDetails(userId);
      return user.status === 'available';
    } catch (error) {
      logger.error('Failed to check user availability', { userId, error });
      return false;
    }
  }
}