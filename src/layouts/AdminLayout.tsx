// src/layouts/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ConfirmDialog } from '../components/common';
import './AdminLayout.css';
import '../styles/admin-global.css'

/**
 * Layout principal para el panel de administración.
 * Incluye sidebar de navegación, header y área de contenido.
 */
export const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [pendingRequests, setPendingRequests] = useState(0);

    // Detectar si es móvil
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMobileSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // TODO: Cargar número de solicitudes pendientes
    useEffect(() => {
        // Aquí se cargaría el número real de solicitudes pendientes
        // Por ahora, usamos un valor de ejemplo
        setPendingRequests(3);
    }, []);

    // Items del menú de navegación
    const menuItems = [
        {
            path: '/admin/dashboard',
            label: 'Dashboard',
            icon: '🏠'
        },
        {
            path: '/admin/students',
            label: 'Estudiantes',
            icon: '👥'
        },
        {
            path: '/admin/teachers',
            label: 'Profesores',
            icon: '👨‍🏫'
        },
        {
            path: '/admin/subjects',
            label: 'Asignaturas',
            icon: '📚'
        },
        {
            path: '/admin/groups',
            label: 'Grupos',
            icon: '🎯'
        },
        {
            path: '/admin/requests',
            label: 'Solicitudes',
            icon: '📝',
            badge: pendingRequests > 0 ? pendingRequests : undefined
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
        } else {
            setIsSidebarOpen(!isSidebarOpen);
        }
    };

    const closeMobileSidebar = () => {
        if (isMobile) {
            setIsMobileSidebarOpen(false);
        }
    };

    // Clases CSS dinámicas
    const layoutClasses = [
        'admin-layout',
        !isSidebarOpen && !isMobile ? 'admin-layout--collapsed' : '',
        isMobileSidebarOpen ? 'admin-layout--mobile-open' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={layoutClasses}>
            {/* Overlay para móvil */}
            {isMobile && isMobileSidebarOpen && (
                <div
                    className="admin-layout__overlay"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar__header">
                    <h2 className="admin-sidebar__title">
                        {(isSidebarOpen || isMobile) ? 'ACAInfo Admin' : 'AI'}
                    </h2>
                </div>

                <nav className="admin-sidebar__nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                            }
                            title={!isSidebarOpen && !isMobile ? item.label : undefined}
                            onClick={closeMobileSidebar}
                        >
                            <span className="admin-sidebar__icon">{item.icon}</span>
                            {(isSidebarOpen || isMobile) && (
                                <>
                                    <span className="admin-sidebar__label">{item.label}</span>
                                    {item.badge && (
                                        <span className="admin-sidebar__badge">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {!isMobile && (
                    <div className="admin-sidebar__footer">
                        <button
                            className="admin-sidebar__toggle"
                            onClick={toggleSidebar}
                            aria-label={isSidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
                        >
                            {isSidebarOpen ? '◀' : '▶'}
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="admin-layout__main">
                {/* Header */}
                <header className="admin-header">
                    <div className="admin-header__left">
                        <button
                            className="admin-header__menu-toggle"
                            onClick={toggleSidebar}
                            aria-label="Toggle menu"
                        >
                            ☰
                        </button>
                        <h1 className="admin-header__brand">Panel de Administración</h1>
                    </div>

                    <div className="admin-header__right">
                        <div className="admin-header__user">
                            <span className="admin-header__user-icon">👤</span>
                            <div className="admin-header__user-info">
                                <span className="admin-header__user-name">{user?.name || 'Admin'}</span>
                                <span className="admin-header__user-role">Administrador</span>
                            </div>
                        </div>

                        <button
                            className="admin-header__logout"
                            onClick={() => setIsLogoutDialogOpen(true)}
                            aria-label="Cerrar sesión"
                        >
                            <span>🚪</span>
                            <span className="admin-header__logout-text">Salir</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isLogoutDialogOpen}
                title="Cerrar Sesión"
                message="¿Está seguro que desea cerrar sesión?"
                confirmText="Cerrar Sesión"
                cancelText="Cancelar"
                confirmButtonClass="confirm-dialog__button--danger"
                onConfirm={handleLogout}
                onCancel={() => setIsLogoutDialogOpen(false)}
            />
        </div>
    );
};