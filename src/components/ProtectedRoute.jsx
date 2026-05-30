import { Navigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import LoadingPage from './ui/LoadingPage';

export default function ProtectedRoute({ children, role }) {
  const { currentUser, authLoading } = useApp();

  if (authLoading) {
    return <LoadingPage />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
