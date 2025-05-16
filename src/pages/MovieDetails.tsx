import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Film } from '../types/Film';
import { filmService } from '../services/filmService';
import { useAuth } from '../contexts/AuthContext';

// Helper function to transform API film data to our Film type
const transformFilmData = (apiFilm: any): Film => {
    // Extract genres from filmGenres array
    const genres = apiFilm.filmGenres?.map((fg: any) => ({
        id: fg.genre?.id || fg.genreId,
        name: fg.genre?.name || `Genre ${fg.genreId}`
    })) || [];

    return {
        id: apiFilm.id,
        title: apiFilm.title,
        description: apiFilm.description || '',
        releaseYear: apiFilm.releaseYear || 0,
        rating: apiFilm.rating || 0,
        coverUrl: apiFilm.coverUrl || '',
        videoUrl: apiFilm.videoUrl || 'none',
        torrentUrl: apiFilm.torrentUrl || '',
        status: apiFilm.status || '',
        genres: genres
    };
};

export const MovieDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [film, setFilm] = useState<Film | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [similarMovies, setSimilarMovies] = useState<Film[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [visibleReviews, setVisibleReviews] = useState(3); // Initially show 3 reviews
    const [hasMoreReviews, setHasMoreReviews] = useState(false);
    const [expanded, setExpanded] = useState(false); // Track if reviews are expanded
    const { user } = useAuth();
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFilm = async () => {
            if (!id) return;
            try {
                const data = await filmService.getFilmById(parseInt(id));
                console.log('Fetched film data:', data); // Debug log
                
                // Transform the API data to match our Film type
                const transformedData = transformFilmData(data);
                console.log('Transformed film data:', transformedData);
                
                setFilm(transformedData);
                
                // After getting film data, fetch similar films based on genres
                if (transformedData.genres && transformedData.genres.length > 0) {
                    try {
                        // Get the first genre ID to find similar movies
                        const firstGenre = transformedData.genres[0];
                        const genreId = typeof firstGenre === 'object' ? firstGenre.id : firstGenre;
                        
                        const similarFilms = await filmService.getFilmsByGenre(genreId);
                        // Filter out the current film from recommendations
                        setSimilarMovies(similarFilms.filter(movie => movie.id !== transformedData.id).slice(0, 4));
                    } catch (err) {
                        console.error('Error fetching similar films:', err);
                    }
                }
            } catch (err) {
                console.error('Error fetching film:', err);
                setError('Failed to load film');
            } finally {
                setLoading(false);
            }
        };

        fetchFilm();
    }, [id]);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            
            setLoadingReviews(true);
            try {
                // Fetch reviews from the API
                const response = await fetch(`https://localhost:7269/api/Reviews/film/${id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch reviews: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Fetched reviews:', data);
                setReviews(data);
                setHasMoreReviews(data.length > visibleReviews);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                // We don't set an error state here to avoid disrupting the UI
                // if reviews fail to load
            } finally {
                setLoadingReviews(false);
            }
        };
        
        fetchReviews();
    }, [id, visibleReviews]);

    const handleWatch = async () => {
        if (!film || !film.videoUrl || film.videoUrl === 'none' || !id) return;
        
        try {
            // Navigate to the video player page with the film details
            navigate(`/watch/${id}`, {
                state: {
                    videoUrl: film.videoUrl,
                    title: film.title
                }
            });
        } catch (err) {
            console.error('Error watching film:', err);
        }
    };

    const handleDownload = async () => {
        if (!film || !film.torrentUrl) return;
        
        try {
            setDownloading(true);
            
            // Simulate download progress
            const interval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 500);
            
            // Try to use IDM if available (using custom URL scheme)
            // This may or may not work depending on the user's browser and if IDM is installed
            const idmLink = document.createElement('a');
            idmLink.href = `idm://${encodeURIComponent(film.torrentUrl)}`;
            idmLink.style.display = 'none';
            document.body.appendChild(idmLink);
            idmLink.click();
            document.body.removeChild(idmLink);
            
            // Fallback to regular browser download
            // Create a hidden download link
            const downloadLink = document.createElement('a');
            downloadLink.href = film.torrentUrl;
            downloadLink.download = `${film.title.replace(/\s+/g, '_')}.mp4`;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Simulate download completion after 5 seconds
            setTimeout(async () => {
                clearInterval(interval);
                setDownloadProgress(100);
                
                // Update the film's videoUrl to the downloaded file path
                // In a real implementation, this would be the local file path
                // For our simulation, we'll use a path to a local file in the public folder
                if (film && id) {
                    try {
                        // Create a local file path for the video
                        // In a real app, this would be the actual downloaded file path
                        // For this demo, we'll use a path in the public folder
                        const localFilePath = `mp4/${film.title.replace(/\s+/g, '_')}.mp4`;
                        
                        const updatedFilm = await filmService.updateFilmVideoUrl(
                            parseInt(id),
                            localFilePath
                        );
                        
                        // Transform the API response
                        const transformedData = transformFilmData(updatedFilm);
                        setFilm(transformedData);
                        
                        // Show a notification
                        alert(`Download complete! The file is saved as ${localFilePath}`);
                    } catch (err) {
                        console.error('Error updating film video URL:', err);
                    }
                }
                
                setDownloading(false);
            }, 5000);
        } catch (err) {
            console.error('Error downloading film:', err);
            setDownloading(false);
        }
    };

    // Handle showing more reviews
    const handleShowMoreReviews = () => {
        setVisibleReviews(prev => {
            const newValue = prev + 3; // Show 3 more reviews
            const moreAvailable = reviews.length > newValue;
            setHasMoreReviews(moreAvailable);
            setExpanded(true);
            return newValue;
        });
    };

    // Handle showing less reviews
    const handleShowLessReviews = () => {
        setVisibleReviews(3); // Reset to initial count
        setHasMoreReviews(reviews.length > 3);
        setExpanded(false);
    };

    // Function to render star rating
    const renderStarRating = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="url(#half-gold)" stroke="#FFD700" strokeWidth="1">
                        <defs>
                            <linearGradient id="half-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="50%" stopColor="#FFD700" />
                                <stop offset="50%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            }
        }
        
        return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
    };

    const handleSubmitReview = async () => {
        if (!user || !film) return;
        
        setSubmittingReview(true);
        setReviewError(null);
        
        try {
            const reviewData = {
                UserId: user.id,
                FilmId: film.id,
                Rating: reviewRating,
                ReviewText: reviewText || null,
                CreatedAt: new Date().toISOString(),
                // Use exact property names from the model
                User: {
                    Id: user.id,
                    Name: user.name,
                    Email: user.email,
                    Role: user.role
                },
                Film: {
                    Id: film.id,
                    Title: film.title,
                    Description: film.description,
                    ReleaseYear: film.releaseYear,
                    Rating: film.rating,
                    CoverUrl: film.coverUrl,
                    VideoUrl: film.videoUrl,
                    TorrentUrl: film.torrentUrl,
                    Status: film.status
                }
            };

            console.log('Submitting review data:', reviewData); // Debug log

            const response = await fetch('https://localhost:7269/api/Reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Review submission error:', errorData); // Debug log
                throw new Error(errorData?.message || 'Failed to submit review');
            }

            // Reset form
            setReviewRating(5);
            setReviewText('');
            
            // Refresh reviews
            const reviewsResponse = await fetch(`https://localhost:7269/api/Reviews/film/${film.id}`);
            if (reviewsResponse.ok) {
                const newReviews = await reviewsResponse.json();
                setReviews(newReviews);
            }
        } catch (err) {
            setReviewError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
            console.error('Error submitting review:', err);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                padding: '20px', 
                fontSize: '18px', 
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh'
            }}>
                Loading...
            </div>
        );
    }

    if (error || !film) {
        return (
            <div style={{ 
                padding: '20px', 
                color: 'red',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh'
            }}>
                {error || 'Film not found'}
            </div>
        );
    }

    // Function to determine if the button should be "Watch" or "Download"
    const getActionButton = () => {
        if (downloading) {
            return (
                <div style={{ width: '100%', maxWidth: '300px', margin: '20px 0' }}>
                    <div style={{ 
                        color: '#fff', 
                        marginBottom: '10px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}>
                        Downloading "{film.title}"
                    </div>
                    <div style={{ 
                        backgroundColor: '#333',
                        borderRadius: '4px',
                        height: '8px',
                        overflow: 'hidden',
                        marginBottom: '8px'
                    }}>
                        <div style={{ 
                            backgroundColor: '#E50914',
                            height: '100%',
                            width: `${downloadProgress}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#aaa', 
                        fontSize: '14px'
                    }}>
                        <span>Downloading... {downloadProgress}%</span>
                        <span>{downloadProgress < 100 ? 'Please wait' : 'Almost done!'}</span>
                    </div>
                    <div style={{
                        marginTop: '12px',
                        fontSize: '13px',
                        color: '#aaa',
                        fontStyle: 'italic'
                    }}>
                        If your download doesn't start automatically, please check your download manager or browser settings.
                    </div>
                </div>
            );
        }
        
        if (film.videoUrl && film.videoUrl !== 'none') {
            return (
                <button
                    onClick={handleWatch}
                    style={{
                        backgroundColor: '#E50914',
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '4px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        margin: '20px 0',
                        boxShadow: '0 4px 10px rgba(229, 9, 20, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F40612';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(229, 9, 20, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#E50914';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(229, 9, 20, 0.3)';
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Watch Now
                    </span>
                </button>
            );
        } else if (film.torrentUrl) {
            return (
                <button
                    onClick={handleDownload}
                    style={{
                        backgroundColor: '#2C3E50',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                        margin: '20px 0'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#34495E';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2C3E50';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                    </div>
                </button>
            );
        } else {
            return (
                <button
                    disabled
                    style={{
                        backgroundColor: '#555',
                        color: '#999',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'not-allowed',
                        margin: '20px 0'
                    }}
                >
                    Not Available
                </button>
            );
        }
    };

    return (
        <div style={{ 
            padding: '40px 10px 100px', // Reduced side padding
            color: 'white',
            maxWidth: '100%',
            margin: '0 auto',
            minHeight: '90vh',
            overflowX: 'hidden', // Prevent horizontal scrolling
            boxSizing: 'border-box' // Include padding in width calculation
        }}>
            {/* Hero Section */}
            <div style={{
                position: 'relative',
                marginBottom: '60px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
                minHeight: '300px',
                display: 'flex',
                alignItems: 'flex-end',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box' // Include padding in width calculation
            }}>
                {/* Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${film?.coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(2px) brightness(0.3)',
                    zIndex: 0
                }} />
                
                {/* Content */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '30px 15px', // Reduced side padding
                    width: '100%',
                    boxSizing: 'border-box' // Include padding in width calculation
                }}>
                    <h1 style={{
                        fontSize: 'clamp(24px, 5vw, 42px)', // Slightly smaller responsive font size
                        fontWeight: 'bold',
                        marginBottom: '16px',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                        wordBreak: 'break-word', // Prevent text overflow
                        overflowWrap: 'break-word'
                    }}>
                        {film?.title}
                    </h1>
                    
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap', // Allow items to wrap on small screens
                        gap: '20px',
                        marginBottom: '20px',
                        color: '#ddd',
                        fontSize: '16px' // Slightly smaller font
                    }}>
                        <div>{film?.releaseYear}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="1">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>{film?.rating}/10</span>
                        </div>
                        {film?.genres && Array.isArray(film.genres) && film.genres.length > 0 && (
                            <div style={{ 
                                display: 'flex', 
                                gap: '8px', 
                                flexWrap: 'wrap',
                                maxWidth: '100%'
                            }}>
                                {film.genres.map((genre, index) => (
                                    <span key={index} style={{ color: '#aaa' }}>
                                        {typeof genre === 'object' && genre !== null ? genre.name : genre}
                                        {index < film.genres.length - 1 ? ',' : ''}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Action Button */}
                    {getActionButton()}
                </div>
            </div>
            
            {/* Main Content */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', // Prevent column overflow
                gap: '20px', // Reduced gap
                alignItems: 'start',
                width: '100%',
                maxWidth: '100%',
                margin: '0 auto 60px',
                boxSizing: 'border-box', // Include padding in width calculation
                overflow: 'hidden' // Prevent overflow
            }}>
                {/* Left Column - Movie Details */}
                <div style={{ 
                    minWidth: 0,  // Prevent overflow
                    maxWidth: '100%',
                    overflow: 'hidden'
                }}>
                    {/* Movie Description */}
                    <div style={{ marginBottom: '40px', maxWidth: '100%' }}>
                        <h2 style={{ 
                            fontSize: '22px', // Slightly smaller
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: '#fff',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingBottom: '10px'
                        }}>
                            Overview
                        </h2>
                        <p style={{ 
                            fontSize: '16px', // Slightly smaller
                            lineHeight: '1.7',
                            color: '#ddd',
                            wordBreak: 'break-word', // Prevent text overflow
                            overflowWrap: 'break-word',
                            maxWidth: '100%'
                        }}>
                            {film?.description || 'No description available.'}
                        </p>
                    </div>
                    
                    {/* Movie Stats */}
                    <div style={{ marginBottom: '40px', maxWidth: '100%' }}>
                        <h2 style={{ 
                            fontSize: '22px', // Slightly smaller
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: '#fff',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingBottom: '10px'
                        }}>
                            Details
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', // Smaller minimum size
                            gap: '20px',
                            color: '#ddd',
                            maxWidth: '100%'
                        }}>
                            <div>
                                <h3 style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Release Year</h3>
                                <p style={{ fontSize: '16px' }}>{film?.releaseYear || 'Unknown'}</p>
                            </div>
                            <div>
                                <h3 style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Rating</h3>
                                <p style={{ fontSize: '16px' }}>
                                    {film?.rating || 'N/A'}
                                </p>
                            </div>
        <div>
                                <h3 style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Status</h3>
                                <p style={{ fontSize: '16px' }}>{film?.status || 'Unknown'}</p>
                            </div>
            <div>
                                <h3 style={{ color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Available Formats</h3>
                                <p style={{ fontSize: '16px' }}>
                                    {(film?.videoUrl && film.videoUrl !== 'none') ? 'Streaming' : ''}
                                    {(film?.videoUrl && film.videoUrl !== 'none') && film?.torrentUrl ? ', ' : ''}
                                    {film?.torrentUrl ? 'Download' : ''}
                                    {(!film?.videoUrl || film?.videoUrl === 'none') && !film?.torrentUrl ? 'None' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Genres Section */}
                    <div style={{ marginBottom: '40px', maxWidth: '100%' }}>
                        <h2 style={{ 
                            fontSize: '22px', // Slightly smaller
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: '#fff',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingBottom: '10px'
                        }}>
                            Genres
                        </h2>
                        <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '10px',
                            maxWidth: '100%'
                        }}>
                            {film?.genres && Array.isArray(film.genres) && film.genres.length > 0 ? (
                                film.genres.map((genre, index) => (
                                    <span 
                                        key={index}
                                        style={{ 
                                            backgroundColor: '#333',
                                            color: '#ddd',
                                            padding: '6px 12px', // Slightly smaller padding
                                            borderRadius: '20px',
                                            fontSize: '14px' // Slightly smaller font
                                        }}
                                    >
                                        {typeof genre === 'object' && genre !== null ? genre.name : genre}
                                    </span>
                                ))
                            ) : (
                                <span style={{ color: '#aaa' }}>No genres available</span>
                            )}
                        </div>
                    </div>
                    
                    {/* After Genres section and before Reviews section */}
                    {user && (
                        <div style={{ marginBottom: '40px', maxWidth: '100%' }}>
                            <h2 style={{ 
                                fontSize: '22px',
                                fontWeight: 'bold',
                                marginBottom: '16px',
                                color: '#fff',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingBottom: '10px'
                            }}>
                                Write a Review
                            </h2>
                            <div style={{ 
                                backgroundColor: 'rgba(30, 30, 30, 0.5)',
                                borderRadius: '8px',
                                padding: '20px',
                                maxWidth: '100%'
                            }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        color: '#ddd',
                                        marginBottom: '8px',
                                        fontSize: '14px'
                                    }}>
                                        Rating
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => setReviewRating(rating)}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    color: rating <= reviewRating ? '#FFD700' : '#aaa',
                                                    borderColor: rating <= reviewRating ? '#FFD700' : '#555'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ 
                                        display: 'block', 
                                        color: '#ddd',
                                        marginBottom: '8px',
                                        fontSize: '14px'
                                    }}>
                                        Your Review
                                    </label>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        style={{
                                            width: '100%',
                                            minHeight: '100px',
                                            padding: '12px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Share your thoughts about this movie..."
                                    />
                                </div>
                                {reviewError && (
                                    <div style={{ 
                                        color: '#ff4444',
                                        marginBottom: '16px',
                                        fontSize: '14px'
                                    }}>
                                        {reviewError}
                                    </div>
                                )}
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview}
                                    style={{
                                        backgroundColor: '#E50914',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '4px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: submittingReview ? 'not-allowed' : 'pointer',
                                        opacity: submittingReview ? 0.7 : 1,
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!submittingReview) {
                                            e.currentTarget.style.backgroundColor = '#F40612';
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!submittingReview) {
                                            e.currentTarget.style.backgroundColor = '#E50914';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Reviews Section */}
                    <div style={{ marginBottom: '40px', maxWidth: '100%' }}>
                        <h2 style={{ 
                            fontSize: '22px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            color: '#fff',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span>Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}</span>
                            {user && (
                                <button 
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: '1px solid #555',
                                        color: '#ddd',
                                        padding: '4px 10px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.borderColor = '#777';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = '#555';
                                    }}
                                >
                                    Write a review
                                </button>
                            )}
                        </h2>
                        
                        {loadingReviews ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '20px',
                                color: '#aaa'
                            }}>
                                Loading reviews...
                            </div>
                        ) : reviews.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {reviews.slice(0, visibleReviews).map(review => (
                                    <div 
                                        key={review.id} 
                                        style={{ 
                                            backgroundColor: 'rgba(30, 30, 30, 0.5)',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            marginBottom: '12px',
                                            flexWrap: 'wrap',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ 
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#555',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    color: '#eee',
                                                    fontSize: '14px'
                                                }}>
                                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                                    {review.user?.name || 'Unknown User'}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {renderStarRating(review.rating)}
                                                    <span style={{ color: '#aaa', fontSize: '14px' }}>
                                                        {review.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <p style={{ 
                                            fontSize: '14px', 
                                            lineHeight: '1.6',
                                            color: '#ddd',
                                            margin: '0'
                                        }}>
                                            {review.reviewText || 'No comment provided.'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ 
                                backgroundColor: 'rgba(30, 30, 30, 0.5)',
                                borderRadius: '8px',
                                padding: '20px',
                                textAlign: 'center',
                                color: '#aaa'
                            }}>
                                No reviews yet. Be the first to review this movie!
                            </div>
                        )}
                        
                        {/* Review Controls */}
                        {reviews.length > 3 && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'center',
                                marginTop: '20px',
                                gap: '10px'
                            }}>
                                {hasMoreReviews && (
                                    <button 
                                        onClick={handleShowMoreReviews}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: '1px solid #555',
                                            color: '#ddd',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.borderColor = '#777';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderColor = '#555';
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                        Show more reviews
                                    </button>
                                )}
                                
                                {expanded && (
                                    <button 
                                        onClick={handleShowLessReviews}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: '1px solid #555',
                                            color: '#ddd',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.borderColor = '#777';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.borderColor = '#555';
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="18 15 12 9 6 15"></polyline>
                                        </svg>
                                        Show less
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Right Column - Poster and Recommendations */}
                <div style={{ 
                    minWidth: 0, // Prevent overflow
                    maxWidth: '100%',
                    overflow: 'hidden'
                }}>
                    {/* Movie Poster */}
                    <div style={{ marginBottom: '30px' }}>
                        <img 
                            src={film?.coverUrl} 
                            alt={film?.title} 
                            style={{ 
                                width: '100%',
                                maxWidth: '100%',
                                borderRadius: '12px',
                                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7)'
                            }}
                        />
                    </div>
                    
                    {/* Similar Movies */}
                    {similarMovies.length > 0 && (
                        <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                            <h2 style={{ 
                                fontSize: '22px', // Slightly smaller
                                fontWeight: 'bold',
                                marginBottom: '16px',
                                color: '#fff',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingBottom: '10px'
                            }}>
                                You May Also Like
                            </h2>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '16px',
                                maxWidth: '100%'
                            }}>
                                {similarMovies.map((movie) => (
                                    <div 
                                        key={movie.id} 
                                        style={{ 
                                            display: 'flex',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            transition: 'background-color 0.2s ease',
                                            overflow: 'hidden',
                                            maxWidth: '100%'
                                        }}
                                        onClick={() => navigate(`/movies/${movie.id}`)}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)' }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                    >
                                        <img 
                                            src={movie.coverUrl} 
                                            alt={movie.title} 
                                            style={{ 
                                                width: '50px', // Slightly smaller
                                                height: '75px', // Slightly smaller
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                flexShrink: 0 // Prevent image from shrinking
                                            }} 
                                        />
                                        <div style={{ 
                                            minWidth: 0, 
                                            overflow: 'hidden',
                                            maxWidth: 'calc(100% - 62px)' // Account for image width + gap
                                        }}>
                                            <h3 style={{ 
                                                fontSize: '14px', // Slightly smaller
                                                fontWeight: 'bold', 
                                                marginBottom: '4px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis' // Add ellipsis for long titles
                                            }}>
                                                {movie.title}
                                            </h3>
                                            <p style={{ fontSize: '12px', color: '#aaa' }}>
                                                {movie.releaseYear} • {movie.rating}/10
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Additional empty space to push footer down */}
            <div style={{ height: '50px' }}></div>
        </div>
    );
}; 