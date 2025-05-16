import { useEffect, useState } from 'react';
import type { Film } from '../types/Film';
import { filmService } from '../services/filmService';
import { FilmCard } from '../components/FilmCard';

export const Movies = () => {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFilms = async () => {
            try {
                const data = await filmService.getAllFilms();
                setFilms(data);
            } catch (err) {
                console.error('Error fetching films:', err);
                setError('Failed to load films');
            } finally {
                setLoading(false);
            }
        };

        fetchFilms();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Movies</h1>
            <div>
                {films.map((film) => (
                    <FilmCard key={film.id} film={film} />
                ))}
            </div>
        </div>
    );
}; 