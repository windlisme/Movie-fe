import type { Film } from '../types/Film';

// Using the proxy configured in vite.config.ts
const API_URL = '/api';

export const filmService = {
    async getAllFilms(): Promise<Film[]> {
        try {
            const response = await fetch(`${API_URL}/Films/all`);
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to fetch films');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching films:', error);
            throw error;
        }
    },

    async getFilmById(id: number): Promise<Film> {
        try {
            console.log(`Fetching film with ID: ${id}`);
            const response = await fetch(`${API_URL}/Films/${id}`);
            
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error(`Failed to fetch film with ID ${id}`);
            }
            
            const responseText = await response.text();
            console.log('Raw API response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Parsed film data:', data);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                throw new Error('Invalid JSON response from API');
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching film ${id}:`, error);
            throw error;
        }
    },

    async getFilmsByGenre(genreId: number): Promise<Film[]> {
        try {
            // Using the query parameter from the FilmsController
            const response = await fetch(`${API_URL}/Films?genreId=${genreId}`);
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to fetch films by genre');
            }
            return response.json();
        } catch (error) {
            console.error(`Error fetching films for genre ${genreId}:`, error);
            throw error;
        }
    },

    async updateFilmVideoUrl(id: number, videoUrl: string): Promise<Film> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/Films/${id}/video-url`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ videoUrl })
            });
            
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to update film video URL');
            }
            
            return response.json();
        } catch (error) {
            console.error(`Error updating film ${id} video URL:`, error);
            throw error;
        }
    },

    async addToWatchHistory(filmId: number): Promise<void> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('User not authenticated');
            }
            
            const response = await fetch(`${API_URL}/WatchHistory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ filmId })
            });
            
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to add to watch history');
            }
        } catch (error) {
            console.error(`Error adding film ${filmId} to watch history:`, error);
            throw error;
        }
    },

    async getFavoriteFilms(): Promise<Film[]> {
        try {
            const response = await fetch(`${API_URL}/Favorites`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to fetch favorites');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching favorites:', error);
            throw error;
        }
    },

    async getWatchHistory(): Promise<Film[]> {
        try {
            const response = await fetch(`${API_URL}/WatchHistory`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to fetch history');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching watch history:', error);
            throw error;
        }
    }
}; 