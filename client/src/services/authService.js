import api from './api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      // For demo purposes, simulate successful login
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        return { user: mockUser, token: mockToken };
      }
      throw new Error('Invalid credentials');
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      // For demo purposes, simulate successful registration
      const mockUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'user'
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      return { user: mockUser, token: mockToken };
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API fails
      console.log('Logout API error:', error);
    }
  }

  async verifyToken(token) {
    try {
      const response = await api.get('/auth/verify');
      return response.user;
    } catch (error) {
      // For demo purposes, return mock user if token exists
      if (token && token.startsWith('mock-jwt-token-')) {
        return {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          role: 'admin'
        };
      }
      throw error;
    }
  }

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, newPassword) {
    return api.post('/auth/reset-password', { token, newPassword });
  }

  async updateProfile(updates) {
    return api.put('/auth/profile', updates);
  }

  async changePassword(oldPassword, newPassword) {
    return api.post('/auth/change-password', { oldPassword, newPassword });
  }
}

export const authService = new AuthService();