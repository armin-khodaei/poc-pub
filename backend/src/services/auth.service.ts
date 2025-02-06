import axios from 'axios';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getAccessToken(): Promise<string> {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const credentials = Buffer.from(`${config.signit.clientId}:${config.signit.clientSecret}`).toString('base64');

      const response = await axios.post<TokenResponse>(
        `${config.signit.apiUrl}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'signature-requests:read signature-requests:write'
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000);

      return this.accessToken;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new UnauthorizedError('Invalid client credentials');
      }
      throw new Error('Failed to obtain access token');
    }
  }
} 