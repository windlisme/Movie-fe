import type { Genre } from '../types';

interface GenreFilterProps {
  genres: Genre[];
  selectedGenre: number | null;
  onSelect: (genreId: number | null) => void;
}

export default function GenreFilter({ genres, selectedGenre, onSelect }: GenreFilterProps) {
  return (
    <select
      value={selectedGenre || ''}
      onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <option value="">All Genres</option>
      {genres.map((genre) => (
        <option key={genre.id} value={genre.id}>
          {genre.name}
        </option>
      ))}
    </select>
  );
} 