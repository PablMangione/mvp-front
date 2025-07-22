// src/pages/admin/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { StatsCard } from '../../components/student/StatsCard';
import { LoadingSpinner } from '../../components/common';
import './Dashboard.css';

/**
 * Dashboard principal del administrador.
 *
 * Esta es la página de entrada al panel administrativo que proporciona
 * una vista general del estado del sistema. Está diseñada para mostrar
 * la información más relevante de forma clara y permitir acciones rápidas.
 *
 * El dashboard se divide en varias secciones:
 * 1. Estadísticas principales - Métricas clave del sistema
 * 2. Solicitudes pendientes - Requieren atención inmediata
 * 3. Resumen por carreras - Distribución de asignaturas
 * 4. Estado de grupos - Ocupación y disponibilidad
 *
 * La información se actualiza automáticamente al cargar la página
 * y puede refrescarse manualmente con el botón de actualizar.
 */
export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const {
        stats,
        pendingRequests,
        loading,
        refreshing,
        error,
        refresh,
        quickApproveRequest,
        occupancyRate,
        topMajors,
        hasData,
        hasPendingRequests
    } = useAdminDashboard();

    /**
     * Maneja la aprobación rápida de una solicitud.
     * Incluye confirmación para evitar aprobaciones accidentales.
     */
    const handleQuickApprove = async (request: any) => {
        const confirmed = window.confirm(
            `¿Aprobar solicitud de ${request.studentName} para ${request.subjectName}?`
        );

        if (confirmed) {
            const success = await quickApproveRequest(request.id);
            if (!success) {
                alert('Error al aprobar la solicitud. Por favor, intente desde la sección de solicitudes.');
            }
        }
    };

    /**
     * Renderiza el estado de carga inicial
     */
    if (loading) {
        return (
            <div className="admin-dashboard">
                <LoadingSpinner
                    size="large"
                    message="Cargando estadísticas del sistema..."
                />
            </div>
        );
    }

    /**
     * Renderiza el estado de error
     */
    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-error">
                    <h2>Error al cargar el dashboard</h2>
                    <p>{error}</p>
                    <button onClick={refresh} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Renderiza el dashboard principal
     */
    return (
        <div className="admin-dashboard">
            {/* Header del dashboard con título y acciones */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <h1>Dashboard Administrativo</h1>
                    <p className="dashboard-subtitle">
                        Vista general del sistema académico
                    </p>
                </div>
                <button
                    className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
                    onClick={refresh}
                    disabled={refreshing}
                    title="Actualizar datos"
                >
                    🔄 {refreshing ? 'Actualizando...' : 'Actualizar'}
                </button>
            </div>

            {/* Grid de estadísticas principales */}
            <div className="stats-grid">
                <StatsCard
                    title="Estudiantes"
                    value={stats?.students.total || 0}
                    description={`${stats?.students.newThisMonth || 0} nuevos este mes`}
                    icon="🎓"
                    actionLabel="Gestionar Estudiantes"
                    actionPath="/admin/students"
                />

                <StatsCard
                    title="Profesores"
                    value={stats?.teachers.total || 0}
                    description={`${stats?.teachers.withActiveGroups || 0} con grupos activos`}
                    icon="👨‍🏫"
                    actionLabel="Gestionar Profesores"
                    actionPath="/admin/teachers"
                />

                <StatsCard
                    title="Asignaturas"
                    value={stats?.subjects.total || 0}
                    description={`${stats?.subjects.withoutGroups || 0} sin grupos`}
                    icon="📚"
                    actionLabel="Gestionar Asignaturas"
                    actionPath="/admin/subjects"
                />

                <StatsCard
                    title="Grupos Activos"
                    value={stats?.groups.active || 0}
                    description={`${occupancyRate}% de ocupación`}
                    icon="👥"
                    actionLabel="Ver Todos los Grupos"
                    actionPath="/admin/groups"
                />
            </div>

            {/* Sección de solicitudes pendientes */}
            {hasPendingRequests && (
                <div className="dashboard-section pending-requests-section">
                    <div className="section-header">
                        <h2>
                            <span className="section-icon">📋</span>
                            Solicitudes Pendientes
                            <span className="badge badge-warning">{pendingRequests.length}</span>
                        </h2>
                        <button
                            className="view-all-button"
                            onClick={() => navigate('/admin/requests')}
                        >
                            Ver todas →
                        </button>
                    </div>

                    <div className="pending-requests-list">
                        {pendingRequests.slice(0, 5).map((request) => (
                            <div key={request.id} className="request-item">
                                <div className="request-info">
                                    <h4>{request.subjectName}</h4>
                                    <p>
                                        Solicitado por: <strong>{request.studentName}</strong>
                                        <span className="request-date">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </p>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="quick-approve-btn"
                                        onClick={() => handleQuickApprove(request)}
                                        title="Aprobar solicitud"
                                    >
                                        ✓ Aprobar
                                    </button>
                                    <button
                                        className="view-details-btn"
                                        onClick={() => navigate('/admin/requests')}
                                        title="Ver detalles"
                                    >
                                        Ver detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid de información secundaria */}
            <div className="info-grid">
                {/* Estado de grupos */}
                <div className="dashboard-section">
                    <h3>
                        <span className="section-icon">📊</span>
                        Estado de Grupos
                    </h3>
                    <div className="groups-summary">
                        <div className="summary-item">
                            <span className="summary-label">Planificados</span>
                            <span className="summary-value">{stats?.groups.planned || 0}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Activos</span>
                            <span className="summary-value text-success">{stats?.groups.active || 0}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Cerrados</span>
                            <span className="summary-value text-muted">{stats?.groups.closed || 0}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-item">
                            <span className="summary-label">Capacidad Total</span>
                            <span className="summary-value">{stats?.groups.totalCapacity || 0}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Estudiantes Inscritos</span>
                            <span className="summary-value">{stats?.groups.totalEnrolled || 0}</span>
                        </div>
                    </div>
                    <div className="occupancy-bar">
                        <div className="occupancy-label">
                            Ocupación General: {occupancyRate}%
                        </div>
                        <div className="occupancy-track">
                            <div
                                className="occupancy-fill"
                                style={{ width: `${occupancyRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Top carreras por asignaturas */}
                <div className="dashboard-section">
                    <h3>
                        <span className="section-icon">🏆</span>
                        Asignaturas por Carrera
                    </h3>
                    <div className="majors-list">
                        {topMajors.length > 0 ? (
                            topMajors.map((major, index) => (
                                <div key={major.name} className="major-item">
                                    <span className="major-rank">{index + 1}</span>
                                    <span className="major-name">{major.name}</span>
                                    <span className="major-count">{major.count} asignaturas</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No hay datos de carreras disponibles</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Accesos rápidos */}
            <div className="quick-actions">
                <h3>Acciones Rápidas</h3>
                <div className="actions-grid">
                    <button
                        className="quick-action-btn"
                        onClick={() => navigate('/admin/students/new')}
                    >
                        <span className="action-icon">➕</span>
                        <span className="action-text">Nuevo Estudiante</span>
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => navigate('/admin/teachers/new')}
                    >
                        <span className="action-icon">➕</span>
                        <span className="action-text">Nuevo Profesor</span>
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => navigate('/admin/groups/new')}
                    >
                        <span className="action-icon">➕</span>
                        <span className="action-text">Nuevo Grupo</span>
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => navigate('/admin/subjects/new')}
                    >
                        <span className="action-icon">➕</span>
                        <span className="action-text">Nueva Asignatura</span>
                    </button>
                </div>
            </div>
        </div>
    );
};