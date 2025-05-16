import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Film } from '../types/Film';
import type { Genre } from '../types/Genre';
import { filmService } from '../services/filmService';
import { genreService } from '../services/genreService';
import { FilmCard } from '../components/FilmCard';

export const GenreFilms = () => {
    const { id } = useParams<{ id: string }>();
    const [films, setFilms] = useState<Film[]>([]);
    const [genre, setGenre] = useState<Genre | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchGenreAndFilms = async () => {
            if (!id) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const genreId = parseInt(id);
                
                // Fetch genre details
                const genreData = await genreService.getGenreById(genreId);
                setGenre(genreData);
                
                // Fetch films by genre
                const genreFilms = await filmService.getFilmsByGenre(genreId);
                setFilms(genreFilms);
            } catch (err) {
                console.error('Error fetching genre films:', err);
                setError('Failed to load films for this genre');
            } finally {
                setLoading(false);
            }
        };

        fetchGenreAndFilms();
    }, [id]);

    if (loading) {
        return <div style={{ padding: '20px', fontSize: '18px', color: 'white' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '30px', color: 'white' }}>
                {genre ? genre.name : 'Genre'} Movies
            </h1>
            
            {films.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: '16px' }}>
                    No movies found in this genre.
                </div>
            ) : (
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '30px',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {films.map((film) => (
                        <FilmCard key={film.id} film={film} />
                    ))}
                </div>
            )}
        </div>
    );
}; 