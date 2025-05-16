import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Review } from '../types';

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0');
  const { user } = useAuth();

  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => api.getFilm(movieId)
  });

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', movieId],
    queryFn: () => api.getReviews(movieId)
  });

  if (isLoadingMovie || isLoadingReviews) {
    return <div>Loading...</div>;
  }

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <img
            src={movie.coverUrl}
            alt={movie.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
          <p className="text-gray-600 mb-4">{movie.description}</p>
          <div className="flex items-center mb-4">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-lg">{movie.rating.toFixed(1)}</span>
          </div>
          <div className="mb-4">
            <span className="text-gray-600">Year: </span>
            <span>{movie.releaseYear}</span>
          </div>
          <div className="mb-4">
            <span className="text-gray-600">Duration: </span>
            <span>{movie.duration} minutes</span>
          </div>
          {movie.filmGenres && (
            <div className="mb-4">
              <span className="text-gray-600">Genres: </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {movie.filmGenres.map(({ genre }) => (
                  genre && (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                    >
                      {genre.name}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: Review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-semibold">{review.rating.toFixed(1)}</span>
                  {review.user && (
                    <span className="text-gray-600 ml-4">
                      by {review.user.name}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 