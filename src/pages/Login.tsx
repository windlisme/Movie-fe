import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Check if there are saved credentials on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            
            // Save or remove email based on rememberMe
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                // Set a longer expiration for the auth token in AuthContext
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberMe');
            }
            
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
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
                }}>Sign In</h1>
                
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
                        Sign In
                    </button>
                </form>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <input 
                            type="checkbox" 
                            id="remember" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{
                                accentColor: '#E50914',
                                width: '16px',
                                height: '16px'
                            }}
                        />
                        <label 
                            htmlFor="remember"
                            style={{
                                color: '#b3b3b3',
                                fontSize: '14px'
                            }}
                        >
                            Remember me
                        </label>
                    </div>
                    <a 
                        href="#" 
                        style={{
                            color: '#b3b3b3',
                            fontSize: '14px',
                            textDecoration: 'none'
                        }}
                    >
                        Need help?
                    </a>
                </div>
                
                <div style={{
                    color: '#737373',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    marginTop: '16px'
                }}>
                    New to Moviel?{' '}
                    <Link to="/register" style={{
                        color: 'white',
                        textDecoration: 'none'
                    }}>
                        Sign up now
                    </Link>
                </div>
            </div>
        </div>
    );
}; 