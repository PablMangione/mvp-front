import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Register.css';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, user, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        major: '',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Si ya está autenticado, redirigir
        if (user) {
            navigate('/student/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        // Limpiar errores al desmontar
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Limpiar error del campo cuando el usuario empieza a escribir
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'El nombre es requerido';
        }

        if (!formData.email.trim()) {
            errors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'El email no es válido';
        }

        if (!formData.password) {
            errors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 8) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Debes confirmar la contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.major) {
            errors.major = 'Debes seleccionar una carrera';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                major: formData.major,
            });
            // La redirección se maneja en el useEffect
        } catch (error) {
            // El error ya se maneja en el contexto
            console.error('Error en registro:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>ACAInfo</h1>
                <h2>Registro de Estudiante</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre completo</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Juan Pérez García"
                            disabled={isLoading}
                            className={formErrors.name ? 'error' : ''}
                        />
                        {formErrors.name && (
                            <span className="field-error">{formErrors.name}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email institucional</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu.nombre@estudiantes.edu"
                            disabled={isLoading}
                            className={formErrors.email ? 'error' : ''}
                        />
                        {formErrors.email && (
                            <span className="field-error">{formErrors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 8 caracteres"
                            disabled={isLoading}
                            className={formErrors.password ? 'error' : ''}
                        />
                        {formErrors.password && (
                            <span className="field-error">{formErrors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
                            disabled={isLoading}
                            className={formErrors.confirmPassword ? 'error' : ''}
                        />
                        {formErrors.confirmPassword && (
                            <span className="field-error">{formErrors.confirmPassword}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="major">Carrera</label>
                        <select
                            id="major"
                            name="major"
                            value={formData.major}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={formErrors.major ? 'error' : ''}
                        >
                            <option value="">Selecciona tu carrera</option>
                            <option value="Ingeniería en Sistemas">Ingeniería en Sistemas</option>
                            <option value="Ingeniería Civil">Ingeniería Civil</option>
                            <option value="Administración de Empresas">Administración de Empresas</option>
                            <option value="Psicología">Psicología</option>
                        </select>
                        {formErrors.major && (
                            <span className="field-error">{formErrors.major}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};