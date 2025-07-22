import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Home: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Usuario autenticado - redirigir según rol
                switch (user.role) {
                    case 'STUDENT':
                        navigate('/student/dashboard', { replace: true });
                        break;
                    case 'TEACHER':
                        navigate('/teacher/dashboard', { replace: true });
                        break;
                    case 'ADMIN':
                        navigate('/admin/dashboard', { replace: true });
                        break;
                    default:
                        navigate('/login', { replace: true });
                }
            } else {
                // No autenticado - ir a login
                navigate('/login', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    // Mostrar loading mientras se verifica autenticación
    return <LoadingSpinner fullScreen message="Cargando ACAInfo..." />;
};