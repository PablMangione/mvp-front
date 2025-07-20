// src/components/student/StudentSidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './StudentSidebar.css';

interface StudentSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

/**
 * Sidebar de navegación para estudiantes.
 * Reemplaza el nav actual que está en cada página.
 */
export const StudentSidebar: React.FC<StudentSidebarProps> = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();

    const menuItems = [
        {
            path: '/student/dashboard',
            label: 'Inicio',
            icon: '🏠'
        },
        {
            path: '/student/subjects',
            label: 'Asignaturas',
            icon: '📚'
        },
        {
            path: '/student/enrollments',
            label: 'Mis Inscripciones',
            icon: '📝'
        },
        {
            path: '/student/group-requests',
            label: 'Solicitudes de Grupo',
            icon: '📋'
        },
        {
            path: '/student/profile',
            label: 'Mi Perfil',
            icon: '👤'
        }
    ];

    return (
        <aside className={`student-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="student-sidebar__header">
                <h2 className="student-sidebar__title" onClick={() => navigate('/student/dashboard')}>
                    {collapsed ? 'ACA' : 'ACAInfo'}
                </h2>
                <button
                    className="student-sidebar__toggle"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            <nav className="student-sidebar__nav">
                <ul className="student-sidebar__menu">
                    {menuItems.map((item) => (
                        <li key={item.path} className="student-sidebar__item">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `student-sidebar__link ${isActive ? 'active' : ''}`
                                }
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="student-sidebar__icon">{item.icon}</span>
                                {!collapsed && (
                                    <span className="student-sidebar__label">{item.label}</span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="student-sidebar__footer">
                {!collapsed && (
                    <p className="student-sidebar__role">Portal de Estudiante</p>
                )}
            </div>
        </aside>
    );
};