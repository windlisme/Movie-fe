import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { genreService } from '../../services/genreService';
import type { Genre } from '../../types';
import './MainLayout.css';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [genreError, setGenreError] = useState<string | null>(null);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      setGenreError(null);
      try {
        console.log('Fetching genres...');
        const data = await genreService.getAllGenres();
        console.log('Genres fetched:', data);
        setGenres(data);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setGenreError('Failed to load genres');
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinkStyle = {
    color: '#808080',
    marginRight: '16px',
    textDecoration: 'none',
    padding: '6px 0',
    transition: 'color 0.3s ease, transform 0.2s ease',
    position: 'relative' as const
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    color: 'white',
    fontWeight: 500,
    borderBottom: '2px solid #E50914',
    paddingBottom: '4px'
  };

  const buttonStyle = {
    backgroundColor: '#E50914',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease'
  };

  const handleNavLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive(e.currentTarget.getAttribute('href') || '')) {
      e.currentTarget.style.color = '#aaaaaa';
    }
  };

  const handleNavLinkLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isActive(e.currentTarget.getAttribute('href') || '')) {
      e.currentTarget.style.color = '#808080';
    }
  };

  return (
    <div className="main-layout">
      {/* Navigation */}
      <nav style={{ 
        backgroundColor: 'rgba(20, 20, 20, 0.95)', 
        borderBottom: '1px solid rgba(24, 24, 24, 0.8)',
        padding: '0 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        boxShadow: scrolled ? '0 2px 12px rgba(0, 0, 0, 0.4)' : '0 2px 10px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          height: scrolled ? '50px' : '64px',
          transition: 'height 0.3s ease'
        }}>
          {/* Logo */}
          <Link to="/" style={{ 
            textDecoration: 'none',
            transform: scrolled ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            <span style={{ 
              color: '#E50914', 
              fontSize: '24px', 
              fontWeight: 'bold'
            }}>MOVIEL</span>
          </Link>

          {/* Search Bar */}
          <div style={{ 
            flex: 1, 
            maxWidth: scrolled ? '450px' : '500px', 
            margin: '0 16px',
            transition: 'max-width 0.3s ease'
          }}>
            {user?.id === 1 ? (
              <div style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: '800',
                textAlign: 'center',
                background: 'linear-gradient(to right, #ffffff, #e0e0e0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.5px',
                padding: '8px 0',
                transform: scrolled ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.3s ease'
              }}>
                Admin Dashboard
              </div>
            ) : (
              <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  style={{
                    width: '100%',
                    backgroundColor: '#181818',
                    color: 'white',
                    padding: scrolled ? '6px 16px' : '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    transition: 'padding 0.3s ease'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#808080',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    width: '20px',
                    height: '20px',
                    opacity: 0.8,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </form>
            )}
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {user && (
              <>
                {user.id === 1 ? (
                  <>
                    <Link
                      to="/users"
                      style={isActive('/users') ? activeNavLinkStyle : navLinkStyle}
                      onMouseEnter={handleNavLinkHover}
                      onMouseLeave={handleNavLinkLeave}
                    >
                      Users
                    </Link>
                    <Link
                      to="/films"
                      style={isActive('/films') ? activeNavLinkStyle : navLinkStyle}
                      onMouseEnter={handleNavLinkHover}
                      onMouseLeave={handleNavLinkLeave}
                    >
                      Films
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/favorites" 
                      style={isActive('/favorites') ? activeNavLinkStyle : navLinkStyle}
                      onMouseEnter={handleNavLinkHover}
                      onMouseLeave={handleNavLinkLeave}
                    >
                      
                    </Link>
                    <Link 
                      to="/history" 
                      style={isActive('/history') ? activeNavLinkStyle : navLinkStyle}
                      onMouseEnter={handleNavLinkHover}
                      onMouseLeave={handleNavLinkLeave}
                    >
                      
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div style={{ marginLeft: '16px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#808080', marginRight: '16px' }}>{user.name}</span>
                <button
                  onClick={() => logout()} 
                  style={{
                    ...buttonStyle,
                    padding: scrolled ? '6px 12px' : '8px 16px',
                    transition: 'all 0.3s ease'
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
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  to="/login"
                  style={isActive('/login') ? activeNavLinkStyle : navLinkStyle}
                  onMouseEnter={handleNavLinkHover}
                  onMouseLeave={handleNavLinkLeave}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{ 
                    ...buttonStyle, 
                    textDecoration: 'none',
                    display: 'inline-block',
                    transform: 'scale(1)',
                    padding: scrolled ? '6px 12px' : '8px 16px',
                    transition: 'all 0.3s ease'
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
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div style={{ marginTop: '64px' }}>
        {/* Genres Bar */}
        {user?.id !== 1 && (
          <div style={{
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            borderBottom: '1px solid rgba(24, 24, 24, 0.8)',
            padding: '0 16px',
            width: '100%',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              scrollbarWidth: 'none' as const,
              msOverflowStyle: 'none' as const,
              WebkitOverflowScrolling: 'touch' as const
            }}>
              <style>
                {`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              
              {/* All Movies Link */}
              <Link 
                to="/" 
                style={{
                  ...isActive('/') ? 
                    { color: 'white', fontWeight: 'bold' } : 
                    { color: '#808080' },
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s ease',
                  marginRight: '8px'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { 
                  if (!isActive('/')) {
                    e.currentTarget.style.color = '#808080';
                  }
                }}
              >
                Movies
              </Link>
              
              {/* Genre Links */}
              {loadingGenres ? (
                <div style={{ padding: '0 12px', color: '#808080', fontSize: '14px' }}>Loading genres...</div>
              ) : (
                genreError ? (
                  <div style={{ padding: '0 12px', color: '#E50914', fontSize: '14px' }}>{genreError}</div>
                ) : (
                  genres.map(genre => (
                    <Link
                      key={genre.id}
                      to={`/genres/${genre.id}`}
                      style={{
                        ...isActive(`/genres/${genre.id}`) ? 
                          { color: 'white', fontWeight: 'bold' } : 
                          { color: '#808080' },
                        padding: '8px 12px',
                        whiteSpace: 'nowrap',
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'color 0.2s ease',
                        marginRight: '8px'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                      onMouseLeave={(e) => {
                        if (!isActive(`/genres/${genre.id}`)) {
                          e.currentTarget.style.color = '#808080';
                        }
                      }}
                    >
                      {genre.name}
                    </Link>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: '20px'
        }}>
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#181818', color: '#808080', padding: '32px 16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>About Moviel</h3>
              <p style={{ fontSize: '14px' }}>
                Your ultimate destination for discovering and enjoying movies.
                Find your next favorite film and share your thoughts with the community.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #808080', textAlign: 'center', fontSize: '14px' }}>
            <p>&copy; {new Date().getFullYear()} Moviel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}