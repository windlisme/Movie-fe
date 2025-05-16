export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Film {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: number;
  coverUrl: string;
  status: string;
  filmGenres?: FilmGenre[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface FilmGenre {
  filmId: number;
  genreId: number;
  genre?: Genre;
}

export interface Review {
  id: number;
  filmId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User;
}

export interface WatchHistory {
  id: number;
  filmId: number;
  userId: number;
  watchedAt: string;
  film?: Film;
}

export interface Favorite {
  id: number;
  filmId: number;
  userId: number;
  createdAt: string;
  film?: Film;
}

export interface CreateFavoriteRequest {
  userId: number;
  filmId: number;
}

export interface AuthResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
} 