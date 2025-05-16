import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ 
      backgroundColor: '#181818',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #333'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ 
          color: '#E50914', 
          textDecoration: 'none', 
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          MOVIELL
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/films" style={{ 
            color: 'white', 
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#E50914'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
            Films
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/users" style={{ 
                color: 'white', 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E50914'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                Users
              </Link>
              <Link to="/genres" style={{ 
                color: 'white', 
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#E50914'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                Genres
              </Link>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user ? (
          <>
            <span style={{ color: 'white' }}>Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#E50914',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
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
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ 
            color: 'white', 
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#E50914'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
} 