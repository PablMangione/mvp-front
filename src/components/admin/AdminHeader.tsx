// src/components/admin/AdminHeader.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AdminHeader.css';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

/**
 * Header del panel administrativo.
 *
 * Proporciona información contextual y acciones rápidas para el administrador.
 * Incluye:
 * - Botón de menú para dispositivos móviles
 * - Información de la sección actual
 * - Notificaciones (preparado para futura implementación)
 * - Información del usuario y menú desplegable
 * - Acceso rápido a configuración y logout
 *
 * El diseño es limpio y profesional, optimizado para sesiones de trabajo
 * prolongadas con acceso rápido a las funciones más importantes.
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Estado para el dropdown del usuario
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Estado para notificaciones (preparado para futura implementación)
    const [showNotifications, setShowNotifications] = useState(false);

    // Simulación de notificaciones pendientes (en producción vendría del backend)
    const pendingNotifications = 3; // Por ejemplo: solicitudes pendientes

    /**
     * Maneja el cierre de sesión del administrador.
     * Limpia la sesión y redirige al login.
     */
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    /**
     * Obtiene un saludo apropiado según la hora del día.
     * Añade un toque personal a la interfaz.
     */
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    /**
     * Cierra todos los dropdowns cuando se hace clic fuera.
     * Mejora la UX evitando que queden menús abiertos.
     */
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.admin-header__user') && !target.closest('.admin-header__notifications')) {
                setShowUserDropdown(false);
                setShowNotifications(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <header className="admin-header">
            <div className="admin-header__left">
                {/* Botón de menú para móvil */}
                <button
                    className="admin-header__menu-btn"
                    onClick={onMenuClick}
                    aria-label="Abrir menú"
                >
                    ☰
                </button>

                {/* Información contextual */}
                <div className="admin-header__context">
                    <h1 className="admin-header__title">Panel de Administración</h1>
                    <p className="admin-header__subtitle">
                        {getGreeting()}, {user?.name || 'Administrador'}
                    </p>
                </div>
            </div>

            <div className="admin-header__right">
                {/* Notificaciones */}
                <div className="admin-header__notifications">
                    <button
                        className="admin-header__notification-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Ver notificaciones"
                    >
                        <span className="notification-icon">🔔</span>
                        {pendingNotifications > 0 && (
                            <span className="notification-badge">{pendingNotifications}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="admin-header__notification-dropdown">
                            <div className="notification-header">
                                <h3>Notificaciones</h3>
                                <button className="mark-all-read">Marcar todas como leídas</button>
                            </div>
                            <div className="notification-list">
                                <div className="notification-item unread">
                                    <span className="notification-dot"></span>
                                    <div className="notification-content">
                                        <p className="notification-text">
                                            3 nuevas solicitudes de grupo pendientes
                                        </p>
                                        <span className="notification-time">Hace 5 minutos</span>
                                    </div>
                                </div>
                                <div className="notification-item">
                                    <div className="notification-content">
                                        <p className="notification-text">
                                            Profesor Juan Pérez asignado a nuevo grupo
                                        </p>
                                        <span className="notification-time">Hace 1 hora</span>
                                    </div>
                                </div>
                            </div>
                            <div className="notification-footer">
                                <button
                                    className="view-all-notifications"
                                    onClick={() => navigate('/admin/notifications')}
                                >
                                    Ver todas las notificaciones
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Acceso rápido a configuración */}
                <button
                    className="admin-header__settings-btn"
                    onClick={() => navigate('/admin/settings')}
                    aria-label="Configuración"
                    title="Configuración del sistema"
                >
                    ⚙️
                </button>

                {/* Información del usuario */}
                <div className="admin-header__user">
                    <button
                        className="admin-header__user-btn"
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                    >
                        <span className="admin-header__user-avatar">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                        <div className="admin-header__user-info">
                            <span className="admin-header__user-name">{user?.name || 'Administrador'}</span>
                            <span className="admin-header__user-role">Administrador</span>
                        </div>
                        <span className="admin-header__dropdown-arrow">▼</span>
                    </button>

                    {showUserDropdown && (
                        <div className="admin-header__dropdown">
                            <div className="admin-header__dropdown-header">
                                <div className="dropdown-avatar">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="dropdown-info">
                                    <p className="admin-header__dropdown-name">{user?.name}</p>
                                    <p className="admin-header__dropdown-email">{user?.email}</p>
                                    <p className="admin-header__dropdown-role">
                                        <span className="role-badge">ADMINISTRADOR</span>
                                    </p>
                                </div>
                            </div>

                            <div className="admin-header__dropdown-divider" />

                            <button
                                className="admin-header__dropdown-item"
                                onClick={() => {
                                    setShowUserDropdown(false);
                                    navigate('/admin/profile');
                                }}
                            >
                                <span>👤</span> Mi Perfil
                            </button>

                            <button
                                className="admin-header__dropdown-item"
                                onClick={() => {
                                    setShowUserDropdown(false);
                                    navigate('/admin/activity-log');
                                }}
                            >
                                <span>📋</span> Registro de Actividad
                            </button>

                            <button
                                className="admin-header__dropdown-item"
                                onClick={() => {
                                    setShowUserDropdown(false);
                                    navigate('/admin/settings');
                                }}
                            >
                                <span>⚙️</span> Configuración
                            </button>

                            <div className="admin-header__dropdown-divider" />

                            <button
                                className="admin-header__dropdown-item admin-header__logout"
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