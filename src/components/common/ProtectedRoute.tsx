import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type {UserRole} from '../../types/auth.types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  allowedRoles,
                                                                  redirectTo = '/login'
                                                              }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Mostrar un spinner o componente de carga
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!user) {
        // No hay usuario autenticado
        return <Navigate to={redirectTo} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // El usuario no tiene el rol permitido
        return <Navigate to="/unauthorized" replace />;
    }

    // Usuario autenticado y autorizado
    return <Outlet />;
};