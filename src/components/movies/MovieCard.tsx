import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Film } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface MovieCardProps {
  movie: Film;
  onFavoriteToggle?: () => void;
}

export default function MovieCard({ movie, onFavoriteToggle }: MovieCardProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (isFavorite) {
        await api.removeFavorite(movie.id);
      } else {
        await api.addFavorite(movie.id);
      }
      setIsFavorite(!isFavorite);
      onFavoriteToggle?.();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={movie.coverUrl || ''}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-75 p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
              <p className="text-sm text-netflix-gray mb-2">
                {movie.releaseYear} • {movie.duration} min
              </p>
              <p className="text-sm line-clamp-3">{movie.description}</p>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {movie.filmGenres?.map(({ genre }) => (
                  <span
                    key={genre?.id}
                    className="text-xs bg-netflix-red px-2 py-1 rounded"
                  >
                    {genre?.name}
                  </span>
                ))}
              </div>
              {user && (
                <button
                  onClick={handleFavoriteClick}
                  className="text-2xl hover:text-netflix-red transition-colors"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
} 