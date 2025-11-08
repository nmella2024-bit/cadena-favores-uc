import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="mt-4 text-text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no tiene email verificado, redirigir a página de verificación
  if (!currentUser.emailVerified) {
    return <Navigate to="/verificar-email" replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return children;
};

export default ProtectedRoute;
