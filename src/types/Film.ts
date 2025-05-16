import type { Genre } from './Genre';

export interface Film {
    id: number;
    title: string;
    coverUrl: string;
    releaseYear: number;
    description: string;
    rating: number;
    genres: (number | Genre)[];
    videoUrl?: string;
    torrentUrl?: string;
    status?: string;
} 