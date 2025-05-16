import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ name, email, password });
            navigate('/');
        } catch (err) {
            setError('Failed to register');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://assets.nflxext.com/ffe/siteui/vlv3/a73c4363-1dcd-4719-b3b1-3725418fd91d/fe1147dd-78fb-44ac-a5ea-5a96e214ebf6/US-en-20231016-popsignuptwoweeks-perspective_alpha_website_large.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                borderRadius: '4px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                padding: '60px',
                width: '100%',
                maxWidth: '450px'
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '28px',
                    textAlign: 'left'
                }}>Sign Up</h1>
                
                {error && <div style={{
                    backgroundColor: '#e87c03',
                    borderRadius: '4px',
                    color: 'white',
                    margin: '0 0 16px',
                    padding: '10px 20px'
                }}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder=" "
                            style={{
                                backgroundColor: '#333',
                                borderRadius: '4px',
                                border: 'none',
                                color: 'white',
                                height: '50px',
                                lineHeight: '50px',
                                padding: '16px 20px 0',
                                width: '100%',
                                fontSize: '16px'
                            }}
                        />
                        <label htmlFor="name" style={{
                            color: '#8c8c8c',
                            fontSize: '14px',
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: name ? 'translateY(-130%)' : 'translateY(-50%)',
                            transition: 'transform 0.2s ease',
                            pointerEvents: 'none',
                            backgroundColor: '#333',
                            padding: '0 4px'
                        }}>Name</label>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder=" "
                            style={{
                                backgroundColor: '#333',
                                borderRadius: '4px',
                                border: 'none',
                                color: 'white',
                                height: '50px',
                                lineHeight: '50px',
                                padding: '16px 20px 0',
                                width: '100%',
                                fontSize: '16px'
                            }}
                        />
                        <label htmlFor="email" style={{
                            color: '#8c8c8c',
                            fontSize: '14px',
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: email ? 'translateY(-130%)' : 'translateY(-50%)',
                            transition: 'transform 0.2s ease',
                            pointerEvents: 'none',
                            backgroundColor: '#333',
                            padding: '0 4px',
                            zIndex: 1
                        }}>Email</label>
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder=" "
                            style={{
                                backgroundColor: '#333',
                                borderRadius: '4px',
                                border: 'none',
                                color: 'white',
                                height: '50px',
                                lineHeight: '50px',
                                padding: '16px 20px 0',
                                width: '100%',
                                fontSize: '16px'
                            }}
                        />
                        <label htmlFor="password" style={{
                            color: '#8c8c8c',
                            fontSize: '14px',
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: password ? 'translateY(-130%)' : 'translateY(-50%)',
                            transition: 'transform 0.2s ease',
                            pointerEvents: 'none',
                            backgroundColor: '#333',
                            padding: '0 4px',
                            zIndex: 1
                        }}>Password</label>
                    </div>
                    
                    <button 
                        type="submit"
                        style={{
                            backgroundColor: '#E50914',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: '24px 0 12px',
                            padding: '16px',
                            width: '100%'
                        }}
                    >
                        Sign Up
                    </button>
                </form>
                
                <div style={{
                    color: '#737373',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    marginTop: '16px'
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{
                        color: 'white',
                        textDecoration: 'none'
                    }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}; 