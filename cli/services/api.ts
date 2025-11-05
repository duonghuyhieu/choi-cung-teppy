import axios, { AxiosInstance } from 'axios';
import { API_ENDPOINTS } from '../config.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const TOKEN_FILE = path.join(os.homedir(), '.game-saver-token');

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from file
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await fs.readFile(TOKEN_FILE, 'utf-8');
      if (this.token) {
        this.setAuthHeader(this.token);
      }
    } catch {
      // Token file doesn't exist
    }
  }

  private async saveToken(token: string) {
    await fs.writeFile(TOKEN_FILE, token, 'utf-8');
  }

  private async deleteToken() {
    try {
      await fs.unlink(TOKEN_FILE);
    } catch {
      // File doesn't exist
    }
  }

  private setAuthHeader(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });

    if (response.data.success && response.data.data.token) {
      const token = response.data.data.token;
      this.token = token;
      await this.saveToken(token);
      this.setAuthHeader(token);
    }

    return response.data;
  }

  async register(email: string, username: string, password: string) {
    const response = await this.client.post(API_ENDPOINTS.REGISTER, {
      email,
      username,
      password,
    });

    if (response.data.success && response.data.data.token) {
      const token = response.data.data.token;
      this.token = token;
      await this.saveToken(token);
      this.setAuthHeader(token);
    }

    return response.data;
  }

  async logout() {
    await this.client.post(API_ENDPOINTS.LOGOUT);
    this.token = null;
    await this.deleteToken();
    delete this.client.defaults.headers.common['Authorization'];
  }

  async getMe() {
    const response = await this.client.get(API_ENDPOINTS.ME);
    return response.data;
  }

  // Games
  async getGames() {
    const response = await this.client.get(API_ENDPOINTS.GAMES);
    return response.data;
  }

  async getGame(id: string) {
    const response = await this.client.get(API_ENDPOINTS.GAME(id));
    return response.data;
  }

  // Saves
  async getSaveFiles(gameId: string) {
    const response = await this.client.get(API_ENDPOINTS.GAME_SAVES(gameId));
    return response.data;
  }

  async uploadSaveFile(
    gameId: string,
    fileBuffer: Buffer,
    fileName: string,
    description?: string,
    isPublic: boolean = false
  ) {
    const FormData = (await import('form-data')).default;
    const formData = new FormData();

    formData.append('file', fileBuffer, fileName);
    formData.append('fileName', fileName);
    if (description) formData.append('description', description);
    formData.append('isPublic', String(isPublic));

    const response = await this.client.post(
      API_ENDPOINTS.GAME_SAVES(gameId),
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    return response.data;
  }

  async getSaveFileDownloadUrl(saveId: string) {
    const response = await this.client.get(API_ENDPOINTS.SAVE(saveId));
    return response.data;
  }

  async deleteSaveFile(saveId: string) {
    const response = await this.client.delete(API_ENDPOINTS.SAVE(saveId));
    return response.data;
  }

  // Helper to download file from URL
  async downloadFile(url: string): Promise<Buffer> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }
}

export const apiClient = new ApiClient();
