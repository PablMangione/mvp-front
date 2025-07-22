// src/components/admin/AdminSidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

interface AdminSidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onToggle: () => void;
    onMobileClose: () => void;
}

/**
 * Sidebar de navegación para administradores.
 *
 * Proporciona acceso rápido a todas las secciones administrativas del sistema.
 * Las opciones están organizadas en grupos lógicos para facilitar la navegación:
 * - Dashboard: Vista general
 * - Gestión Académica: Asignaturas y Grupos
 * - Gestión de Usuarios: Estudiantes y Profesores
 * - Solicitudes: Gestión de peticiones de grupos
 *
 * El componente soporta dos estados:
 * - Expandido: Muestra iconos y texto
 * - Colapsado: Solo muestra iconos con tooltips
 *
 * En móvil, se comporta como un menú deslizable.
 */
export const AdminSidebar: React.FC<AdminSidebarProps> = ({
                                                              collapsed,
                                                              mobileOpen,
                                                              onToggle,
                                                              onMobileClose
                                                          }) => {
    const navigate = useNavigate();

    /**
     * Estructura de navegación organizada por secciones.
     * Cada item incluye:
     * - path: Ruta de React Router
     * - label: Texto mostrado
     * - icon: Emoji representativo (en producción usar iconos SVG)
     * - section: Agrupación lógica
     */
    const menuSections = [
        {
            title: 'General',
            items: [
                {
                    path: '/admin/dashboard',
                    label: 'Dashboard',
                    icon: '📊',
                    description: 'Vista general del sistema'
                }
            ]
        },
        {
            title: 'Gestión Académica',
            items: [
                {
                    path: '/admin/subjects',
                    label: 'Asignaturas',
                    icon: '📚',
                    description: 'Gestionar asignaturas'
                },
                {
                    path: '/admin/groups',
                    label: 'Grupos',
                    icon: '👥',
                    description: 'Gestionar grupos de curso'
                }
            ]
        },
        {
            title: 'Gestión de Usuarios',
            items: [
                {
                    path: '/admin/students',
                    label: 'Estudiantes',
                    icon: '🎓',
                    description: 'Gestionar estudiantes'
                },
                {
                    path: '/admin/teachers',
                    label: 'Profesores',
                    icon: '👨‍🏫',
                    description: 'Gestionar profesores'
                }
            ]
        },
        {
            title: 'Solicitudes',
            items: [
                {
                    path: '/admin/requests',
                    label: 'Solicitudes de Grupo',
                    icon: '📋',
                    description: 'Revisar solicitudes pendientes'
                }
            ]
        }
    ];

    /**
     * Maneja el clic en el logo/título.
     * Navega al dashboard principal.
     */
    const handleLogoClick = () => {
        navigate('/admin/dashboard');
        if (mobileOpen) {
            onMobileClose();
        }
    };

    /**
     * Maneja el clic en un item del menú.
     * En móvil, cierra el menú después de navegar.
     */
    const handleItemClick = () => {
        if (mobileOpen) {
            onMobileClose();
        }
    };

    /**
     * Determina las clases CSS del sidebar basándose en su estado.
     * Combina clases para collapsed y mobile-open.
     */
    const sidebarClasses = `
        admin-sidebar 
        ${collapsed ? 'collapsed' : ''} 
        ${mobileOpen ? 'mobile-open' : ''}
    `.trim();

    return (
        <aside className={sidebarClasses}>
            {/* Header del sidebar con logo y botón de toggle */}
            <div className="admin-sidebar__header">
                <h2
                    className="admin-sidebar__title"
                    onClick={handleLogoClick}
                    title="Ir al Dashboard"
                >
                    {collapsed ? 'ACA' : 'ACAInfo Admin'}
                </h2>

                {/* Botón para colapsar/expandir - solo en desktop */}
                <button
                    className="admin-sidebar__toggle desktop-only"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                    title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                >
                    {collapsed ? '→' : '←'}
                </button>

                {/* Botón para cerrar - solo en móvil */}
                <button
                    className="admin-sidebar__close mobile-only"
                    onClick={onMobileClose}
                    aria-label="Cerrar menú"
                >
                    ✕
                </button>
            </div>

            {/* Navegación principal */}
            <nav className="admin-sidebar__nav">
                {menuSections.map((section) => (
                    <div key={section.title} className="admin-sidebar__section">
                        {/* Título de sección - solo visible cuando está expandido */}
                        {!collapsed && (
                            <h3 className="admin-sidebar__section-title">
                                {section.title}
                            </h3>
                        )}

                        {/* Items del menú */}
                        <ul className="admin-sidebar__menu">
                            {section.items.map((item) => (
                                <li key={item.path} className="admin-sidebar__item">
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `admin-sidebar__link ${isActive ? 'active' : ''}`
                                        }
                                        title={collapsed ? item.label : item.description}
                                        onClick={handleItemClick}
                                    >
                                        <span className="admin-sidebar__icon">
                                            {item.icon}
                                        </span>
                                        {!collapsed && (
                                            <span className="admin-sidebar__label">
                                                {item.label}
                                            </span>
                                        )}
                                        {/* Indicador de item activo */}
                                        {!collapsed && (
                                            <span className="admin-sidebar__indicator" />
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer del sidebar */}
            <div className="admin-sidebar__footer">
                {!collapsed && (
                    <>
                        <p className="admin-sidebar__role">Panel Administrativo</p>
                        <p className="admin-sidebar__version">v1.0.0</p>
                    </>
                )}
                {collapsed && (
                    <span className="admin-sidebar__footer-icon" title="Panel Administrativo">
                        ⚙️
                    </span>
                )}
            </div>
        </aside>
    );
};