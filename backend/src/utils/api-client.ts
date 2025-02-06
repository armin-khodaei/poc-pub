import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { AuthService } from '../services/auth.service';

export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.axiosInstance = axios.create({
      baseURL: config.signit.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add request interceptor to add token
    this.axiosInstance.interceptors.request.use(async config => {
      const token = await this.authService.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  get client(): AxiosInstance {
    return this.axiosInstance;
  }
}
