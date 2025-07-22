import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import './Login.css';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, error, clearError, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Si ya está autenticado, redirigir según su rol
        if (user && !authLoading) {
            switch (user.role) {
                case 'STUDENT':
                    navigate('/student/dashboard');
                    break;
                case 'TEACHER':
                    navigate('/teacher/dashboard');
                    break;
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                default:
                    console.error('Unknown role:', user.role);
            }
        }
    }, [user, navigate, authLoading]);

    useEffect(() => {
        // Limpiar errores al desmontar el componente
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            await login(formData);
            // La redirección se maneja en el useEffect
        } catch (error) {
            // El error ya se maneja en el contexto
            console.error('Error en login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Mostrar loading mientras verifica la autenticación
    if (authLoading) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <h1>ACAInfo</h1>
                    <LoadingSpinner size="medium" message="Verificando sesión..." />
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>ACAInfo</h1>
                <h2>Iniciar Sesión</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="tu.email@universidad.edu"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner size="small" className="loading-spinner--inline" />
                                <span>Iniciando sesión...</span>
                            </>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        ¿Eres estudiante y no tienes cuenta?{' '}
                        <Link to="/register">Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};