import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// API Configuration - Production URL
export const API_URL = process.env.API_URL || 'https://choi-cung-teppy.vercel.app';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  ME: `${API_URL}/api/auth/me`,

  // Games
  GAMES: `${API_URL}/api/games`,
  GAME: (id: string) => `${API_URL}/api/games/${id}`,
  GAME_DOWNLOADS: (id: string) => `${API_URL}/api/games/${id}/downloads`,
  GAME_SAVES: (id: string) => `${API_URL}/api/games/${id}/saves`,

  // Saves
  SAVE: (id: string) => `${API_URL}/api/saves/${id}`,
};
