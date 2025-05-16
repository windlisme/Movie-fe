import { useEffect, useState } from 'react';
import type { Film } from '../types/Film';
import { filmService } from '../services/filmService';
import { FilmCard } from '../components/FilmCard';

export const History = () => {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await filmService.getWatchHistory();
                setFilms(data);
            } catch (err) {
                console.error('Error fetching history:', err);
                setError('Failed to load history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Watch History</h1>
            <div>
                {films.map((film) => (
                    <FilmCard key={film.id} film={film} />
                ))}
            </div>
        </div>
    );
}; 