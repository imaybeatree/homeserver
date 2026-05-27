import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '@/hooks/use-saved-shows';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {

  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const currentUser = getCurrentUser();

  
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute
