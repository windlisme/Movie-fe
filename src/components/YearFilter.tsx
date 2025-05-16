interface YearFilterProps {
  selectedYear: number | null;
  onSelect: (year: number | null) => void;
}

export default function YearFilter({ selectedYear, onSelect }: YearFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <select
      value={selectedYear || ''}
      onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <option value="">All Years</option>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
} 