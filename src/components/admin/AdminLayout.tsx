// src/components/admin/AdminLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar.tsx';
import { AdminHeader } from './AdminHeader';
import './AdminLayout.css';

interface AdminLayoutProps {
    children?: React.ReactNode;
}

/**
 * Layout principal para el panel administrativo.
 *
 * Este componente actúa como el contenedor maestro que estructura
 * la interfaz del administrador. Gestiona:
 * - La disposición del sidebar, header y contenido principal
 * - El estado de colapso/expansión del sidebar
 * - La responsividad en dispositivos móviles
 *
 * Utiliza el patrón de composición con React Router's Outlet
 * para renderizar las rutas hijas manteniendo la estructura común.
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    // Estado para controlar si el sidebar está colapsado
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Estado para el menú móvil (solo se muestra en pantallas pequeñas)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    /**
     * Alterna el estado del sidebar entre expandido y colapsado.
     * En desktop: cambia el ancho del sidebar
     * En móvil: abre/cierra el menú lateral
     */
    const toggleSidebar = () => {
        // En pantallas pequeñas, toggleamos el menú móvil
        if (window.innerWidth <= 1024) {
            setMobileMenuOpen(!mobileMenuOpen);
        } else {
            // En desktop, colapsamos/expandimos
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    /**
     * Cierra el menú móvil cuando se hace clic en el overlay
     */
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="admin-layout">
            {/* Sidebar de navegación */}
            <AdminSidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileMenuOpen}
                onToggle={toggleSidebar}
                onMobileClose={closeMobileMenu}
            />

            {/* Contenedor principal que se ajusta según el estado del sidebar */}
            <div className={`admin-layout__main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                {/* Header con información del usuario y acciones globales */}
                <AdminHeader onMenuClick={toggleSidebar} />

                {/* Área de contenido principal */}
                <main className="admin-layout__content">
                    {/*
                        Outlet renderiza las rutas hijas definidas en App.tsx
                        Si se pasa children directamente, los usa en su lugar
                    */}
                    {children || <Outlet />}
                </main>
            </div>

            {/* Overlay para móvil - se muestra cuando el menú está abierto */}
            {mobileMenuOpen && (
                <div
                    className="admin-layout__mobile-overlay"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}
        </div>
    );
};