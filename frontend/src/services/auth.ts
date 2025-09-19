class AuthService {
  async login(agentEmail: string): Promise<string> {
    // In production, this would make an API call to get a real JWT
    // For now, we'll create a mock token
    const token = btoa(JSON.stringify({
      agentEmail,
      iat: Date.now(),
      exp: Date.now() + 86400000 // 24 hours
    }));
    
    return token;
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('agentEmail');
    localStorage.removeItem('sessionId');
  }
  
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = JSON.parse(atob(token));
      return decoded.exp > Date.now();
    } catch {
      return false;
    }
  }
  
  getAgentEmail(): string | null {
    return localStorage.getItem('agentEmail');
  }
}

export const authService = new AuthService();