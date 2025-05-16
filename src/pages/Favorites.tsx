import { useEffect, useState } from 'react';
import type { Film } from '../types/Film';
import { filmService } from '../services/filmService';
import { FilmCard } from '../components/FilmCard';

export const Favorites = () => {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await filmService.getFavoriteFilms();
                setFilms(data);
            } catch (err) {
                console.error('Error fetching favorites:', err);
                setError('Failed to load favorites');
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Favorites</h1>
            <div>
                {films.map((film) => (
                    <FilmCard key={film.id} film={film} />
                ))}
            </div>
        </div>
    );
}; 