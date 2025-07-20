// src/pages/student/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStudentDashboard } from '../../hooks/student/useStudentDashboard.ts';
import { StatsCard } from '../../components/student/StatsCard';
import './Dashboard.css';

/**
 * Dashboard del estudiante - REFACTORIZADO
 *
 * Cambios principales:
 * 1. El header y nav ahora están en StudentLayout
 * 2. La lógica se movió a useStudentDashboard hook
 * 3. Las tarjetas ahora usan el componente StatsCard
 * 4. Mantiene toda la funcionalidad original
 */
export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        stats,
        groupRequestStats,
        loading,
        error,
        refresh,
    } = useStudentDashboard();

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading">Cargando dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-message">
                    {error}
                    <button onClick={refresh} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            {/* Sección de bienvenida */}
            <div className="welcome-section">
                <h2>Bienvenido, {user?.name || 'Estudiante'}!</h2>
                <p className="student-info">
                    <strong>Email:</strong> {user?.email || 'No disponible'}<br />
                    <strong>Carrera:</strong> {user?.major || stats?.major || 'No disponible'}
                </p>
            </div>

            {/* Grid de tarjetas - usando el componente reutilizable */}
            <div className="dashboard-grid">
                <StatsCard
                    title="Inscripciones Activas"
                    value={stats?.activeEnrollments || 0}
                    description="Grupos en los que estás inscrito"
                    actionLabel="Ver Inscripciones"
                    actionPath="/student/enrollments"
                />

                <StatsCard
                    title="Asignaturas Disponibles"
                    value={stats?.remainingSubjects || 0}
                    description="Asignaturas de tu carrera por cursar"
                    actionLabel="Explorar Asignaturas"
                    actionPath="/student/subjects"
                />

                <StatsCard
                    title="Solicitudes de Grupo"
                    value={groupRequestStats.pending}
                    description="Solicitudes pendientes"
                    actionLabel="Ver Solicitudes"
                    actionPath="/student/group-requests"
                />

                <div className="dashboard-card">
                    <h3>Mi Perfil</h3>
                    <p className="card-description">Actualiza tu información personal</p>
                    <button
                        className="card-action"
                        onClick={() => navigate('/student/profile')}
                    >
                        Editar Perfil
                    </button>
                </div>
            </div>

            {/* Resumen de progreso - mantiene la estructura original */}
            <div className="recent-activity">
                <h3>Resumen de tu progreso</h3>
                {stats ? (
                    <div className="progress-stats">
                        <p><strong>Total de inscripciones:</strong> {stats.totalEnrollments}</p>
                        <p><strong>Pagos pendientes:</strong> {stats.pendingPayments}</p>
                        <p><strong>Asignaturas cursadas:</strong> {stats.enrolledSubjects} de {stats.totalSubjectsInMajor}</p>
                        <p><strong>Solicitudes de grupo totales:</strong> {groupRequestStats.total}</p>
                        {groupRequestStats.approved > 0 && (
                            <p><strong>Solicitudes aprobadas:</strong> {groupRequestStats.approved}</p>
                        )}
                        {groupRequestStats.rejected > 0 && (
                            <p><strong>Solicitudes rechazadas:</strong> {groupRequestStats.rejected}</p>
                        )}
                    </div>
                ) : (
                    <p className="no-activity">No hay datos de progreso para mostrar.</p>
                )}
            </div>
        </div>
    );
};