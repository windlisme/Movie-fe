import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}; 