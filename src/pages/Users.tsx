import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  passwordHash: string;
  favorites?: string[];
  reviews?: string[];
  watchHistory?: string[];
}

type SortField = 'id' | 'name' | 'email' | 'role' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function Users() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'createdAt') {
      comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
    } else {
      comparison = a[sortField] > b[sortField] ? 1 : -1;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const filteredUsers = sortedUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
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

    fetchUsers();
  }, []); // Remove user and navigate from dependencies to only run on mount

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add user');
      }

      const addedUser = await response.json();
      setUsers([...users, addedUser]);
      setShowAddForm(false);
      setNewUser({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user');
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // First get the user data from API to get passwordHash and createdAt
      const userResponse = await fetch(`/api/users/${editingUser.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();

      // Combine API data (passwordHash, createdAt) with frontend data (name, email, role)
      const updateData = {
        id: editingUser.id,
        email: editForm.email,
        name: editForm.name,
        role: editForm.role,
        passwordHash: userData.passwordHash,
        createdAt: userData.createdAt
      };

      // Send the update request
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to update user: ${errorData}`);
      }

      // Update the local state
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role }
          : u
      ));
      setEditingUser(null);
      setEditForm({ name: '', email: '', role: '' });
      
      // Show success message
      setSuccessMessage('User updated successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: '' });
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete user: ${errorData}`);
      }

      // Update the local state
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
      
      // Show success message
      setSuccessMessage('User deleted successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const handleDeleteCancel = () => {
    setUserToDelete(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
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
      {userToDelete && (
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
            Are you sure you want to delete user {userToDelete.name}? This action cannot be undone.
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
            Add New User
          </button>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
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

      {/* Add User Form */}
      {showAddForm && (
        <div style={{ 
          backgroundColor: '#181818', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
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
              <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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
              <label style={{ display: 'block', marginBottom: '8px', color: '#808080' }}>Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                Add User
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
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '200px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '250px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '120px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '150px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('createdAt')}>
                Created At {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#808080', width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px', color: '#808080' }}>{user.id}</td>
                <td style={{ padding: '12px', color: 'white' }}>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                    user.name
                  )}
                </td>
                <td style={{ padding: '12px', color: 'white' }}>
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                    user.email
                  )}
                </td>
                <td style={{ padding: '12px', color: 'white' }}>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        backgroundColor: '#181818',
                        color: 'white',
                        width: '100%'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td style={{ padding: '12px', color: 'white' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px' }}>
                  {editingUser?.id === user.id ? (
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
                        onClick={() => handleEditClick(user)}
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
                        onClick={() => handleDeleteClick(user)}
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
            ))}
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
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = '#E50914';
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
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== pageNumber) {
                      e.currentTarget.style.backgroundColor = '#181818';
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
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = '#E50914';
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