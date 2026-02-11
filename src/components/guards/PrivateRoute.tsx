import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context';
import { Loading } from '../common';

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
