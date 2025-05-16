import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { filmService } from '../services/filmService';
import { useAuth } from '../contexts/AuthContext';

export const VideoPlayer = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<number | null>(null);
    
    // Get the video URL from the location state or query params
    let videoUrl = location.state?.videoUrl || 
                   new URLSearchParams(location.search).get('videoUrl');
    const filmTitle = location.state?.title || 
                      new URLSearchParams(location.search).get('title') || 
                      'Movie';
    
    // Handle local file paths
    if (videoUrl && !videoUrl.startsWith('http') && !videoUrl.startsWith('blob:')) {
        // If it's a relative path from public folder, ensure it starts with /
        if (!videoUrl.startsWith('/')) {
            videoUrl = `/${videoUrl}`;
        }
        
        // For paths like "mp4/tmp.mp4", convert to "/mp4/tmp.mp4"
        videoUrl = videoUrl.replace(/^\/+/, '/');
        
        console.log('Using local video path:', videoUrl);
    }
    
    useEffect(() => {
        const initPlayer = async () => {
            if (!videoUrl) {
                setError('Video URL not provided');
                setLoading(false);
                return;
            }
            
            // Add to watch history if user is logged in and film ID is available
            if (user && id) {
                try {
                    await filmService.addToWatchHistory(parseInt(id));
                } catch (err) {
                    console.error('Error adding to watch history:', err);
                    // Continue even if adding to history fails
                }
            }
            
            setLoading(false);
        };
        
        initPlayer();
        
        // Set up keyboard controls
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!videoRef.current) return;
            
            switch (e.key) {
                case ' ':  // Space bar
                    togglePlay();
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    videoRef.current.currentTime += 10;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    videoRef.current.currentTime -= 10;
                    e.preventDefault();
                    break;
                case 'f':
                    toggleFullscreen();
                    e.preventDefault();
                    break;
                case 'm':
                    toggleMute();
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (controlsTimeoutRef.current) {
                window.clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [id, videoUrl, user]);
    
    const handleBackClick = () => {
        navigate(-1); // Go back to the previous page
    };
    
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    const togglePlay = () => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        
        setCurrentTime(videoRef.current.currentTime);
    };
    
    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        
        setDuration(videoRef.current.duration);
    };
    
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        
        const newTime = parseFloat(e.target.value);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };
    
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
    };
    
    const toggleMute = () => {
        if (!videoRef.current) return;
        
        videoRef.current.muted = !videoRef.current.muted;
    };
    
    const toggleFullscreen = () => {
        if (!playerContainerRef.current) return;
        
        if (!isFullscreen) {
            if (playerContainerRef.current.requestFullscreen) {
                playerContainerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        
        setIsFullscreen(!isFullscreen);
    };
    
    const handleMouseMove = () => {
        setShowControls(true);
        
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }
        
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: '#000',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid rgba(255, 255, 255, 0.3)', 
                        borderTop: '4px solid #E50914', 
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <style>
                        {`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}
                    </style>
                    <div>Loading player...</div>
                </div>
            </div>
        );
    }
    
    if (error || !videoUrl) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: '#000',
                color: 'white',
                padding: '20px'
            }}>
                <div style={{ marginBottom: '20px', color: '#E50914', fontSize: '20px' }}>
                    {error || 'Video not available'}
                </div>
                <button 
                    onClick={handleBackClick}
                    style={{
                        backgroundColor: '#E50914',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
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
                    Back to movie
                </button>
            </div>
        );
    }
    
    return (
        <div style={{ 
            backgroundColor: '#000',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header - only visible when controls are shown */}
            <div style={{ 
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                opacity: showControls ? 1 : 0,
                transition: 'opacity 0.3s ease',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100
            }}>
                <button 
                    onClick={handleBackClick}
                    style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                </button>
                
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                    {filmTitle}
                </div>
                
                <div style={{ width: '48px' }}></div> {/* Empty div for balance */}
            </div>
            
            {/* Video Player */}
            <div 
                ref={playerContainerRef}
                style={{ 
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    backgroundColor: '#000',
                    overflow: 'hidden',
                    cursor: showControls ? 'default' : 'none'
                }}
                onMouseMove={handleMouseMove}
                onClick={togglePlay}
            >
                <video 
                    ref={videoRef}
                    autoPlay
                    style={{ 
                        width: '100%', 
                        height: '100vh',
                        objectFit: 'contain',
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                
                {/* Play/Pause Overlay */}
                {!isPlaying && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="none">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </div>
                )}
                
                {/* Custom Controls */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '10px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: showControls ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                }}>
                    {/* Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: 'white', fontSize: '14px', marginRight: '10px' }}>
                            {formatTime(currentTime)}
                        </span>
                        <input 
                            type="range" 
                            min="0" 
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            style={{ 
                                flex: 1,
                                height: '4px',
                                borderRadius: '2px',
                                background: `linear-gradient(to right, #E50914 ${(currentTime / (duration || 1)) * 100}%, #555 ${(currentTime / (duration || 1)) * 100}%)`,
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ color: 'white', fontSize: '14px', marginLeft: '10px' }}>
                            {formatTime(duration)}
                        </span>
                    </div>
                    
                    {/* Control Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Play/Pause Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    border: 'none', 
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginRight: '15px',
                                    padding: '5px'
                                }}
                            >
                                {isPlaying ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
                                        <rect x="6" y="4" width="4" height="16"></rect>
                                        <rect x="14" y="4" width="4" height="16"></rect>
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                )}
                            </button>
                            
                            {/* Volume Control */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                    style={{ 
                                        backgroundColor: 'transparent', 
                                        border: 'none', 
                                        color: 'white',
                                        cursor: 'pointer',
                                        marginRight: '10px',
                                        padding: '5px'
                                    }}
                                >
                                    {volume === 0 ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <line x1="23" y1="9" x2="17" y2="15"></line>
                                            <line x1="17" y1="9" x2="23" y2="15"></line>
                                        </svg>
                                    ) : volume < 0.5 ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                        </svg>
                                    )}
                                </button>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ 
                                        width: '80px',
                                        height: '4px',
                                        borderRadius: '2px',
                                        background: `linear-gradient(to right, white ${volume * 100}%, #555 ${volume * 100}%)`,
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                        
                        {/* Right Controls */}
                        <div>
                            {/* Fullscreen Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    border: 'none', 
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                {isFullscreen ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Debug info - only visible in development */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{ 
                    padding: '10px', 
                    color: '#555', 
                    fontSize: '12px',
                    textAlign: 'center',
                    borderTop: '1px solid #333'
                }}>
                    Video path: {videoUrl}
                </div>
            )}
        </div>
    );
}; 