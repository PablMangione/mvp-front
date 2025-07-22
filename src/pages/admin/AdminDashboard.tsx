// src/pages/admin/AdminDashboard.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../hooks/admin';
import { LoadingSpinner } from '../../components/common';
import './AdminDashboard.css';

/**
 * Dashboard principal del administrador.
 * Muestra estadísticas generales y accesos rápidos a las diferentes secciones.
 */
export const AdminDashboard: React.FC = () => {
    const { stats, loading, error, fetchDashboardStats } = useDashboard();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    if (loading && !stats) {
        return <LoadingSpinner fullScreen message="Cargando dashboard..." />;
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error-container">
                    <h2>Error al cargar el dashboard</h2>
                    <p>{error}</p>
                    <button onClick={() => fetchDashboardStats()}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Panel de Administración</h1>
                <p className="dashboard-subtitle">
                    Bienvenido al sistema de gestión académica
                </p>
            </div>

            {/* Tarjetas de estadísticas principales */}
            <div className="stats-grid">
                <Link to="/admin/students" className="stat-card stat-card--students">
                    <div className="stat-card__icon">👥</div>
                    <div className="stat-card__content">
                        <h3>Estudiantes</h3>
                        <p className="stat-card__value">{stats?.totalStudents || 0}</p>
                        <span className="stat-card__label">Total registrados</span>
                    </div>
                </Link>

                <Link to="/admin/teachers" className="stat-card stat-card--teachers">
                    <div className="stat-card__icon">👨‍🏫</div>
                    <div className="stat-card__content">
                        <h3>Profesores</h3>
                        <p className="stat-card__value">{stats?.totalTeachers || 0}</p>
                        <span className="stat-card__label">Total activos</span>
                    </div>
                </Link>

                <Link to="/admin/subjects" className="stat-card stat-card--subjects">
                    <div className="stat-card__icon">📚</div>
                    <div className="stat-card__content">
                        <h3>Asignaturas</h3>
                        <p className="stat-card__value">{stats?.totalSubjects || 0}</p>
                        <span className="stat-card__label">En el sistema</span>
                    </div>
                </Link>

                <Link to="/admin/groups" className="stat-card stat-card--groups">
                    <div className="stat-card__icon">🎯</div>
                    <div className="stat-card__content">
                        <h3>Grupos</h3>
                        <p className="stat-card__value">{stats?.totalGroups || 0}</p>
                        <span className="stat-card__label">Total creados</span>
                    </div>
                </Link>
            </div>

            {/* Sección de actividad reciente */}
            <div className="dashboard-sections">
                <div className="dashboard-section">
                    <h2>Actividad Reciente</h2>
                    <div className="activity-summary">
                        <div className="activity-item">
                            <span className="activity-icon">🆕</span>
                            <div>
                                <strong>{stats?.recentActivity.newStudents || 0}</strong>
                                <span>Nuevos estudiantes esta semana</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <span className="activity-icon">📝</span>
                            <div>
                                <strong>{stats?.recentActivity.newEnrollments || 0}</strong>
                                <span>Nuevas inscripciones</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <span className="activity-icon">❌</span>
                            <div>
                                <strong>{stats?.recentActivity.cancelledEnrollments || 0}</strong>
                                <span>Inscripciones canceladas</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Solicitudes Pendientes</h2>
                    <div className="pending-requests">
                        <div className="request-summary">
                            <div className="request-count">
                                <span className="count-value">{stats?.pendingRequests || 0}</span>
                                <span className="count-label">Solicitudes por revisar</span>
                            </div>
                            <Link to="/admin/requests" className="btn btn-primary">
                                Ver Solicitudes
                            </Link>
                        </div>
                        {stats?.pendingRequests && stats.pendingRequests > 0 && (
                            <p className="alert-message">
                                ⚠️ Hay solicitudes de grupo esperando aprobación
                            </p>
                        )}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Ocupación de Grupos</h2>
                    <div className="occupancy-stats">
                        <div className="occupancy-item">
                            <div className="occupancy-label">Promedio de ocupación</div>
                            <div className="occupancy-value">
                                {stats?.groupOccupancy.average || 0}%
                            </div>
                            <div className="occupancy-bar">
                                <div
                                    className="occupancy-bar__fill"
                                    style={{ width: `${stats?.groupOccupancy.average || 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="occupancy-summary">
                            <div className="summary-item">
                                <span className="summary-value">{stats?.groupOccupancy.full || 0}</span>
                                <span className="summary-label">Grupos llenos</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-value">{stats?.groupOccupancy.nearFull || 0}</span>
                                <span className="summary-label">Casi llenos (90%+)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="quick-actions">
                <h2>Acciones Rápidas</h2>
                <div className="action-buttons-grid">
                    <Link to="/admin/students/new" className="action-button">
                        <span className="action-icon">➕</span>
                        <span>Nuevo Estudiante</span>
                    </Link>
                    <Link to="/admin/teachers/new" className="action-button">
                        <span className="action-icon">➕</span>
                        <span>Nuevo Profesor</span>
                    </Link>
                    <Link to="/admin/subjects/new" className="action-button">
                        <span className="action-icon">➕</span>
                        <span>Nueva Asignatura</span>
                    </Link>
                    <Link to="/admin/groups/new" className="action-button">
                        <span className="action-icon">➕</span>
                        <span>Nuevo Grupo</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};