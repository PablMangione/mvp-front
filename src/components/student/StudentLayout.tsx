// src/components/student/StudentLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import './StudentLayout.css';

interface StudentLayoutProps {
    children?: React.ReactNode;
}

/**
 * Layout principal para el dashboard del estudiante.
 * Reemplaza el header y nav que actualmente están en cada página.
 */
export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="student-layout">
            <StudentSidebar
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
            />

            <div className={`student-layout__main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <StudentHeader onMenuClick={toggleSidebar} />

                <main className="student-layout__content">
                    {/* Outlet renderiza las rutas hijas, o children si se pasa directamente */}
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};