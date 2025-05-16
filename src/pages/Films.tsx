import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Film {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: string;
  status: string;
  coverUrl: string;
  videoUrl: string;
  createdAt: string;
}

type SortField = 'id' | 'title' | 'releaseYear' | 'duration' | 'rating' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function Films() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFilm, setNewFilm] = useState({
    title: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    duration: 0,
    rating: 'PG',
    status: 'pending',
    coverUrl: '',
    videoUrl: ''
  });
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingFilm, setEditingFilm] = useState<Film | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    releaseYear: 0,
    duration: 0,
    rating: '',
    status: '',
    coverUrl: '',
    videoUrl: ''
  });
  const [filmToDelete, setFilmToDelete] = useState<Film | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFilms = [...films].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'createdAt') {
      comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
    } else {
      comparison = a[sortField] > b[sortField] ? 1 : -1;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const filteredFilms = sortedFilms.filter(film => 
    film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    film.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    film.rating.toLowerCase().includes(searchQuery.toLowerCase()) ||
    film.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredFilms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFilms = filteredFilms.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchFilms = async () => {
    try {
      const response = await fetch('/api/films/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch films');
      const data = await response.json();
      setFilms(data);
    } catch (err) {
      setError('Failed to load films');
      console.error('Error fetching films:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.id !== 1) {
      navigate('/');
      return;
    }

    fetchFilms();
  }, [user, navigate]);

  const handleAddFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/films', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newFilm)
      });

      if (!response.ok) {
        throw new Error('Failed to add film');
      }

      const addedFilm = await response.json();
      setFilms([...films, addedFilm]);
      setShowAddForm(false);
      setNewFilm({
        title: '',
        description: '',
        releaseYear: new Date().getFullYear(),
        duration: 0,
        rating: 'PG',
        status: 'pending',
        coverUrl: '',
        videoUrl: ''
      });
      setSuccessMessage('Film added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error adding film:', error);
      setError('Failed to add film');
    }
  };

  const handleEditClick = (film: Film) => {
    setEditingFilm(film);
    setEditForm({
      title: film.title,
      description: film.description,
      releaseYear: film.releaseYear,
      duration: film.duration,
      rating: film.rating,
      status: film.status,
      coverUrl: film.coverUrl,
      videoUrl: film.videoUrl
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilm) return;

    try {
      const response = await fetch(`/api/films/${editingFilm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...editingFilm,
          ...editForm
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update film: ${errorData}`);
      }

      // Update the local state
      setFilms(films.map(f => 
        f.id === editingFilm.id 
          ? { ...f, ...editForm }
          : f
      ));
      setEditingFilm(null);
      setEditForm({
        title: '',
        description: '',
        releaseYear: 0,
        duration: 0,
        rating: '',
        status: '',
        coverUrl: '',
        videoUrl: ''
      });
      
      setSuccessMessage('Film updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating film:', error);
      setError(error instanceof Error ? error.message : 'Failed to update film');
    }
  };

  const handleEditCancel = () => {
    setEditingFilm(null);
    setEditForm({
      title: '',
      description: '',
      releaseYear: 0,
      duration: 0,
      rating: '',
      status: '',
      coverUrl: '',
      videoUrl: ''
    });
  };

  const handleDeleteClick = (film: Film) => {
    setFilmToDelete(film);
  };

  const handleDeleteConfirm = async () => {
    if (!filmToDelete) return;

    try {
      const response = await fetch(`/api/films/${filmToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete film: ${errorData}`);
      }

      // Update the local state
      setFilms(films.filter(f => f.id !== filmToDelete.id));
      setFilmToDelete(null);
      
      setSuccessMessage('Film deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting film:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete film');
    }
  };

  const handleDeleteCancel = () => {
    setFilmToDelete(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914]"></div>
        <div className="text-white text-xl">Loading films...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="text-red-500 text-xl">{error}</div>
    </div>
  );

  return (
    <div style={{ padding: '0px 20px 20px 20px' }}>
      {/* Success Message */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#2ecc71',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          border: '2px solid #E50914'
        }}>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#e74c3c',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {error}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {filmToDelete && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#181818',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #333',
          width: '300px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>Confirm Delete</h3>
          <p style={{ color: '#808080', marginBottom: '20px', fontSize: '14px' }}>
            Are you sure you want to delete film {filmToDelete.title}? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleDeleteCancel}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: 'transparent',
                color: '#808080',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#E50914',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        marginTop: '10px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: '#E50914',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F40612';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#E50914';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Film
          </button>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search films..."
              style={{
                padding: '8px 16px',
                paddingLeft: '36px',
                borderRadius: '4px',
                border: '1px solid #333',
                backgroundColor: '#181818',
                color: 'white',
                width: '250px',
                fontSize: '14px'
              }}
            />
            <svg
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#808080'
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
      </div>

      {/* Add Film Form */}
      {showAddForm && (
        <div style={{ 
          backgroundColor: '#181818', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <form onSubmit={handleAddFilm} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Title</label>
              <input
                type="text"
                value={newFilm.title}
                onChange={(e) => setNewFilm({ ...newFilm, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: 'white'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Description</label>
              <textarea
                value={newFilm.description}
                onChange={(e) => setNewFilm({ ...newFilm, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  minHeight: '100px'
                }}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Release Year</label>
                <input
                  type="number"
                  value={newFilm.releaseYear}
                  onChange={(e) => setNewFilm({ ...newFilm, releaseYear: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    color: 'white'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Duration (minutes)</label>
                <input
                  type="number"
                  value={newFilm.duration}
                  onChange={(e) => setNewFilm({ ...newFilm, duration: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    color: 'white'
                  }}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Rating</label>
                <select
                  value={newFilm.rating}
                  onChange={(e) => setNewFilm({ ...newFilm, rating: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    color: 'white'
                  }}
                  required
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Status</label>
                <select
                  value={newFilm.status}
                  onChange={(e) => setNewFilm({ ...newFilm, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    color: 'white'
                  }}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Cover URL</label>
              <input
                type="url"
                value={newFilm.coverUrl}
                onChange={(e) => setNewFilm({ ...newFilm, coverUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: 'white'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Video URL</label>
              <input
                type="url"
                value={newFilm.videoUrl}
                onChange={(e) => setNewFilm({ ...newFilm, videoUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: 'white'
                }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: 'transparent',
                  color: '#808080',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#E50914',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add Film
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Container */}
      <div style={{ 
        backgroundColor: '#181818', 
        borderRadius: '8px',
        border: '1px solid #333',
        marginBottom: '20px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '80px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('id')}>
                ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '200px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('title')}>
                Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '100px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('releaseYear')}>
                Year {sortField === 'releaseYear' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '100px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('duration')}>
                Duration {sortField === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '100px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('rating')}>
                Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFilms.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#808080' }}>
                  {searchQuery ? 'No films found matching your search' : 'No films available'}
                </td>
              </tr>
            ) : (
              paginatedFilms.map(film => (
                <tr 
                  key={film.id} 
                  style={{ 
                    borderBottom: '1px solid #333',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1f1f1f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px', color: '#808080' }}>{film.id}</td>
                  <td style={{ padding: '12px', color: 'white' }}>
                    {editingFilm?.id === film.id ? (
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #333',
                          backgroundColor: '#181818',
                          color: 'white',
                          width: '100%'
                        }}
                      />
                    ) : (
                      film.title
                    )}
                  </td>
                  <td style={{ padding: '12px', color: 'white' }}>
                    {editingFilm?.id === film.id ? (
                      <input
                        type="number"
                        value={editForm.releaseYear}
                        onChange={(e) => setEditForm({ ...editForm, releaseYear: parseInt(e.target.value) })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #333',
                          backgroundColor: '#181818',
                          color: 'white',
                          width: '100%'
                        }}
                      />
                    ) : (
                      film.releaseYear
                    )}
                  </td>
                  <td style={{ padding: '12px', color: 'white' }}>
                    {editingFilm?.id === film.id ? (
                      <input
                        type="number"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #333',
                          backgroundColor: '#181818',
                          color: 'white',
                          width: '100%'
                        }}
                      />
                    ) : (
                      `${film.duration} min`
                    )}
                  </td>
                  <td style={{ padding: '12px', color: 'white' }}>
                    {editingFilm?.id === film.id ? (
                      <select
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #333',
                          backgroundColor: '#181818',
                          color: 'white',
                          width: '100%'
                        }}
                      >
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="NC-17">NC-17</option>
                      </select>
                    ) : (
                      film.rating
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingFilm?.id === film.id ? (
                      <>
                        <button
                          onClick={handleEditSubmit}
                          style={{
                            backgroundColor: '#E50914',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginRight: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F40612';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E50914';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Submit
                        </button>
                        <button
                          onClick={handleEditCancel}
                          style={{
                            backgroundColor: '#E50914',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F40612';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E50914';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(film)}
                          style={{
                            backgroundColor: '#E50914',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginRight: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F40612';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E50914';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(film)}
                          style={{
                            backgroundColor: '#E50914',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F40612';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#E50914';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '20px',
          gap: '10px',
          backgroundColor: '#181818',
          borderTop: '1px solid #333'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #333',
              backgroundColor: currentPage === 1 ? '#333' : '#E50914',
              color: 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: currentPage === 1 ? '0.5' : '1'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = '#F40612';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = '#E50914';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Previous
          </button>

          {/* Page Numbers */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #333',
                    backgroundColor: currentPage === pageNumber ? '#E50914' : '#181818',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '40px',
                    fontWeight: currentPage === pageNumber ? 'bold' : 'normal'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== pageNumber) {
                      e.currentTarget.style.backgroundColor = '#F40612';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== pageNumber) {
                      e.currentTarget.style.backgroundColor = '#181818';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #333',
              backgroundColor: currentPage === totalPages ? '#333' : '#E50914',
              color: 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: currentPage === totalPages ? '0.5' : '1'
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = '#F40612';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = '#E50914';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 