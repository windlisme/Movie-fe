import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Film } from '../types';
import api from '../services/api';
import MovieCard from '../components/movies/MovieCard';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import YearFilter from '../components/YearFilter';
import Pagination from '../components/Pagination';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: moviesResponse, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['movies', searchQuery, selectedGenre, selectedYear, currentPage],
    queryFn: () => api.getFilms({
      search: searchQuery,
      genreId: selectedGenre || undefined,
      year: selectedYear || undefined,
      page: currentPage,
      pageSize
    })
  });

  const { data: genres, isLoading: isLoadingGenres } = useQuery({
    queryKey: ['genres'],
    queryFn: api.getGenres
  });

  const { data: allMovies } = useQuery({
    queryKey: ['allMovies'],
    queryFn: api.getAllFilms
  });

  const isLoading = isLoadingMovies || isLoadingGenres;
  const movies = moviesResponse?.data || [];
  const totalPages = moviesResponse?.totalPages || 0;
  const totalCount = moviesResponse?.totalCount || 0;

  // Get featured movie (highest rated movie from all movies)
  const featuredMovie = allMovies?.reduce((prev: Film, current: Film) => 
    (current.rating > prev.rating) ? current : prev
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      {!searchQuery && !selectedGenre && !selectedYear && featuredMovie && (
        <div className="relative h-[500px] rounded-lg overflow-hidden mb-8">
          <img
            src={featuredMovie.coverUrl}
            alt={featuredMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent">
            <div className="absolute bottom-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{featuredMovie.title}</h1>
              <p className="text-white mb-4">{featuredMovie.description}</p>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {searchQuery || selectedGenre || selectedYear ? 'Search Results' : 'Popular Movies'}
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <GenreFilter
            genres={genres || []}
            selectedGenre={selectedGenre}
            onSelect={setSelectedGenre}
          />
          <YearFilter
            selectedYear={selectedYear}
            onSelect={setSelectedYear}
          />
        </div>
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie: Film) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 