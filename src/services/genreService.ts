import type { Genre } from '../types';

// Using the proxy configured in vite.config.ts
const API_URL = '/api';

export const genreService = {
    async getAllGenres(): Promise<Genre[]> {
        try {
            const response = await fetch(`${API_URL}/Genres`);
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to fetch genres');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching genres:', error);
            throw error;
        }
    },

    async getGenreById(id: number): Promise<Genre> {
        try {
            const response = await fetch(`${API_URL}/Genres/${id}`);
            if (!response.ok) {
                console.error('API Error:', response.status, response.statusText);
                throw new Error('Failed to fetch genre');
            }
            return response.json();
        } catch (error) {
            console.error(`Error fetching genre ${id}:`, error);
            throw error;
        }
    }
}; 