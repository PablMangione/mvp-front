import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../api/student.api';
import type { StudentStats, GroupRequestStats } from '../../types/student.types';
import './Dashboard.css';

export const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [groupRequestStats, setGroupRequestStats] = useState<GroupRequestStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener estadísticas del estudiante
            const [statsData, requestsData] = await Promise.all([
                studentApi.getStats(),
                studentApi.getMyGroupRequests()
            ]);

            setStats(statsData);

            // Calcular estadísticas de solicitudes
            const requestStats = {
                total: requestsData.length,
                pending: requestsData.filter(r => r.status === 'PENDING').length,
                approved: requestsData.filter(r => r.status === 'APPROVED').length,
                rejected: requestsData.filter(r => r.status === 'REJECTED').length
            };

            setGroupRequestStats(requestStats);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">Cargando dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="error-message">
                    {error}
                    <button onClick={fetchDashboardData} className="retry-button">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>ACAInfo - Panel de Estudiante</h1>
                    <div className="header-actions">
                        <span className="user-name">Hola, {user?.name}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <nav className="dashboard-nav">
                <ul>
                    <li>
                        <a href="#" className="nav-link active">Inicio</a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/subjects')} className="nav-link">
                            Asignaturas
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/enrollments')} className="nav-link">
                            Mis Inscripciones
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/profile')} className="nav-link">
                            Mi Perfil
                        </a>
                    </li>
                </ul>
            </nav>

            <main className="dashboard-main">
                <div className="welcome-section">
                    <h2>Bienvenido, {user?.name || 'Estudiante'}!</h2>
                    <p className="student-info">
                        <strong>Email:</strong> {user?.email || 'No disponible'}<br />
                        <strong>Carrera:</strong> {user?.major || stats?.major || 'No disponible'}
                    </p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Inscripciones Activas</h3>
                        <p className="card-number">{stats?.activeEnrollments || 0}</p>
                        <p className="card-description">Grupos en los que estás inscrito</p>
                        <button
                            className="card-action"
                            onClick={() => navigate('/student/enrollments')}
                        >
                            Ver Inscripciones
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h3>Asignaturas Disponibles (no matriculadas)</h3>
                        <p className="card-number">{stats?.remainingSubjects || 0}</p>
                        <p className="card-description">Asignaturas de tu carrera por cursar</p>
                        <button
                            className="card-action"
                            onClick={() => navigate('/student/subjects')}
                        >
                            Explorar Asignaturas
                        </button>
                    </div>

                    <div className="dashboard-card">
                        <h3>Solicitudes de Grupo</h3>
                        <p className="card-number">{groupRequestStats.pending}</p>
                        <p className="card-description">Solicitudes pendientes</p>
                        <button
                            className="card-action"
                            onClick={() => navigate('/student/group-requests')}
                        >
                            Ver Solicitudes
                        </button>
                    </div>

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
            </main>
        </div>
    );
};