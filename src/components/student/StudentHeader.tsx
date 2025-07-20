// src/components/student/StudentHeader.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './StudentHeader.css';

interface StudentHeaderProps {
    onMenuClick: () => void;
}

/**
 * Header del dashboard del estudiante.
 * Reemplaza el header actual que está en cada página.
 * Usa los tipos existentes de User del proyecto.
 */
export const StudentHeader: React.FC<StudentHeaderProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = React.useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <header className="student-header">
            <div className="student-header__left">
                <button
                    className="student-header__menu-btn"
                    onClick={onMenuClick}
                    aria-label="Abrir menú"
                >
                    ☰
                </button>

                <h1 className="student-header__title">
                    Panel de Estudiante
                </h1>
            </div>

            <div className="student-header__right">
                <div className="student-header__user">
                    <button
                        className="student-header__user-btn"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
            <span className="student-header__user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'E'}
            </span>
                        <span className="student-header__user-info">
              <span className="student-header__user-name">Hola, {user?.name}</span>
              <span className="student-header__user-email">{user?.email}</span>
            </span>
                        <span className="student-header__dropdown-arrow">▼</span>
                    </button>

                    {showDropdown && (
                        <div className="student-header__dropdown">
                            <div className="student-header__dropdown-header">
                                <p className="student-header__dropdown-name">{user?.name}</p>
                                <p className="student-header__dropdown-email">{user?.email}</p>
                                {user?.major && (
                                    <p className="student-header__dropdown-major">Carrera: {user.major}</p>
                                )}
                            </div>
                            <div className="student-header__dropdown-divider" />
                            <button
                                className="student-header__dropdown-item"
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate('/student/profile');
                                }}
                            >
                                <span>👤</span> Mi Perfil
                            </button>
                            <button
                                className="student-header__dropdown-item student-header__logout"
                                onClick={handleLogout}
                            >
                                <span>🚪</span> Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};