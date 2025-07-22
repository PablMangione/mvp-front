// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import type { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
    redirectTo?: string;
    children?: React.ReactNode;
}

/**
 * Componente para proteger rutas según autenticación y roles.
 * Verifica que el usuario esté autenticado y tenga el rol requerido.
 * Redirige al login o página de error si no cumple los requisitos.
 *
 * Usa Outlet por defecto para rutas anidadas, o children si se proporciona.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  allowedRoles,
                                                                  redirectTo = '/login',
                                                                  children
                                                              }) => {
    const { user, loading } = useAuth();

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return <LoadingSpinner fullScreen message="Verificando autenticación..." />;
    }

    // Si no está autenticado, redirigir al login
    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }

    // Si se requiere roles específicos y el usuario no los tiene
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirigir al dashboard correspondiente según el rol del usuario
        const dashboardRoutes: Record<UserRole, string> = {
            STUDENT: '/student/dashboard',
            TEACHER: '/teacher/dashboard',
            ADMIN: '/admin/dashboard'
        };

        const userDashboard = dashboardRoutes[user.role] || '/unauthorized';

        return <Navigate to={userDashboard} replace />;
    }

    // Usuario autenticado y autorizado
    // Si hay children, renderizarlos; si no, usar Outlet para rutas anidadas
    return children ? <>{children}</> : <Outlet />;
};