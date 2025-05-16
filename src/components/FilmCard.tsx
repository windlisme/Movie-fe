import { Link } from 'react-router-dom';
import type { Film } from '../types/Film';
import { useState } from 'react';
import './FilmCard.css';

interface FilmCardProps {
    film: Film;
}

export const FilmCard = ({ film }: FilmCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Fallback image for when the cover URL is missing or fails to load
    const fallbackImageUrl = 'https://via.placeholder.com/300x450?text=No+Image';
    
    return (
        <div 
            className="film-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link to={`/movies/${film.id}`} style={{ textDecoration: 'none' }}>
                <img 
                    src={imageError || !film.coverUrl ? fallbackImageUrl : film.coverUrl} 
                    alt={film.title} 
                    className="film-card-image"
                    onError={() => setImageError(true)}
                />
                <div className="film-card-content">
                    <h3 className="film-card-title">
                        {film.title}
                    </h3>
                    <p className="film-card-year">
                        {film.releaseYear}
                    </p>
                </div>
            </Link>
        </div>
    );
}; 