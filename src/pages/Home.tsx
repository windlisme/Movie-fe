import { useEffect, useState } from 'react';
import type { Film } from '../types/Film';
import { filmService } from '../services/filmService';
import { FilmCard } from '../components/FilmCard';
import './Home.css';

export const Home = () => {
    const [films, setFilms] = useState<Film[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchFilms = async () => {
            try {
                console.log('Fetching films...');
                const data = await filmService.getAllFilms();
                console.log('Films fetched successfully:', data);
                setFilms(data);
            } catch (err) {
                console.error('Error fetching films:', err);
                setError('Failed to load films. Please make sure the backend API is running.');
                // Set some mock data so the UI still renders something
                setFilms([
                    { 
                        id: 1, 
                        title: 'Sample Movie 1', 
                        releaseYear: 2023, 
                        coverUrl: '', 
                        description: 'Sample movie when API is unavailable',
                        rating: 8.5,
                        genres: []
                    },
                    { 
                        id: 2, 
                        title: 'Sample Movie 2', 
                        releaseYear: 2023, 
                        coverUrl: '', 
                        description: 'Sample movie when API is unavailable',
                        rating: 7.8,
                        genres: []
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchFilms();
    }, []);

    if (loading) {
        return (
            <div className="home-container">
                <div className="loading-text" style={{ fontSize: '24px', padding: '40px', textAlign: 'center' }}>
                    Loading films...
                </div>
            </div>
        );
    }

    return (
        <div 
            className="home-container" 
            style={{ 
                backgroundColor: '#141414', 
                minHeight: '100vh',
                padding: '20px',
                color: 'white'
            }}
        >
            <h1 className="home-title">Movies</h1>
            
            {error && (
                <div className="error-text" style={{ 
                    padding: '15px', 
                    margin: '20px 0', 
                    backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}>
                    {error}
                </div>
            )}
            
            <div className="films-grid">
                {films.map((film) => (
                    <FilmCard key={film.id} film={film} />
                ))}
            </div>
        </div>
    );
};