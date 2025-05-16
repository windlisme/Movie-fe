import axios from 'axios';
import type { Film, Genre, User, LoginRequest, RegisterRequest, Review, Favorite, WatchHistory, AuthResponse } from '../types';

// Using the proxy configured in vite.config.ts
const API_URL = '/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export interface GetFilmsParams {
  search?: string;
  year?: number;
  genreId?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const api = {
  // Films
  async getAllFilms(): Promise<Film[]> {
    const response = await axiosInstance.get<Film[]>('/films/all');
    return response.data;
  },

  async getFilms(params: GetFilmsParams = {}): Promise<PaginatedResponse<Film>> {
    const response = await axiosInstance.get<Film[]>('/films', { params });
    return {
      data: response.data,
      totalCount: parseInt(response.headers['x-total-count'] || '0'),
      totalPages: parseInt(response.headers['x-total-pages'] || '0'),
      currentPage: parseInt(response.headers['x-current-page'] || '1')
    };
  },

  async getFilm(id: number): Promise<Film> {
    const response = await axiosInstance.get<Film>(`/films/${id}`);
    return response.data;
  },

  // Genres
  async getGenres(): Promise<Genre[]> {
    const response = await axiosInstance.get<Genre[]>('/genres');
    return response.data;
  },

  async getGenre(id: number): Promise<Genre> {
    const response = await axiosInstance.get<Genre>(`/genres/${id}`);
    return response.data;
  },

  // Auth
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },

  // Favorites
  async getFavorites(): Promise<Favorite[]> {
    const response = await axiosInstance.get<Favorite[]>('/favorites');
    return response.data;
  },

  async addFavorite(filmId: number): Promise<Favorite> {
    const response = await axiosInstance.post<Favorite>('/favorites', { filmId });
    return response.data;
  },

  async removeFavorite(filmId: number): Promise<void> {
    await axiosInstance.delete(`/favorites/${filmId}`);
  },

  // Reviews
  async getFilmReviews(filmId: number): Promise<Review[]> {
    const response = await axiosInstance.get<Review[]>(`/reviews/film/${filmId}`);
    return response.data;
  },

  async getUserReviews(userId: number): Promise<Review[]> {
    const response = await axiosInstance.get<Review[]>(`/reviews/user/${userId}`);
    return response.data;
  },

  async addReview(review: Review): Promise<Review> {
    const response = await axiosInstance.post<Review>('/reviews', review);
    return response.data;
  },

  async updateReview(id: number, review: Review): Promise<void> {
    await axiosInstance.put(`/reviews/${id}`, review);
  },

  async deleteReview(id: number): Promise<void> {
    await axiosInstance.delete(`/reviews/${id}`);
  },

  // Watch History
  async getWatchHistory(): Promise<WatchHistory[]> {
    const response = await axiosInstance.get<WatchHistory[]>('/watch-history');
    return response.data;
  },

  async addToWatchHistory(filmId: number): Promise<WatchHistory> {
    const response = await axiosInstance.post<WatchHistory>('/watch-history', { filmId });
    return response.data;
  }
};

export default api; 