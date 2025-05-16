import type { Film } from '../types';

interface MovieCardProps {
  movie: Film;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={movie.coverUrl}
        alt={movie.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{movie.releaseYear}</p>
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="text-sm">{movie.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
} 