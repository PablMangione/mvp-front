import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../api/student.api';
import type { EnrollmentSummary } from '../../types/student.types';
import './Enrollment.css';

export const Enrollments: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelStatus, setCancelStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const data = await studentApi.getMyEnrollments();
            setEnrollments(data);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            setError('Error al cargar las inscripciones');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEnrollment = async (enrollmentId: number) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta inscripción?')) {
            return;
        }

        try {
            setCancelStatus('Cancelando inscripción...');
            await studentApi.cancelEnrollment(enrollmentId);
            setCancelStatus('Inscripción cancelada exitosamente');

            // Recargar las inscripciones
            await fetchEnrollments();

            setTimeout(() => setCancelStatus(null), 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cancelar la inscripción';
            setCancelStatus(errorMessage);
            setTimeout(() => setCancelStatus(null), 5000);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <span className="payment-badge paid">Pagado</span>;
            case 'PENDING':
                return <span className="payment-badge pending">Pendiente</span>;
            case 'FAILED':
                return <span className="payment-badge failed">Fallido</span>;
            default:
                return <span className="payment-badge">{status}</span>;
        }
    };

    const getGroupTypeBadge = (type: string) => {
        return type === 'REGULAR'
            ? <span className="group-type-badge regular">Regular</span>
            : <span className="group-type-badge intensive">Intensivo</span>;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calcular estadísticas
    const stats = {
        total: enrollments.length,
        paid: enrollments.filter(e => e.paymentStatus === 'PAID').length,
        pending: enrollments.filter(e => e.paymentStatus === 'PENDING').length,
        failed: enrollments.filter(e => e.paymentStatus === 'FAILED').length
    };

    return (
        <div className="enrollments-container">
            <header className="enrollments-header">
                <div className="header-content">
                    <h1>ACAInfo - Mis Inscripciones</h1>
                    <div className="header-actions">
                        <span className="user-name">Hola, {user?.name}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <nav className="enrollments-nav">
                <ul>
                    <li>
                        <a href="#" onClick={() => navigate('/student/dashboard')} className="nav-link">
                            Inicio
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/subjects')} className="nav-link">
                            Asignaturas
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link active">Mis Inscripciones</a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/profile')} className="nav-link">
                            Mi Perfil
                        </a>
                    </li>
                </ul>
            </nav>

            <main className="enrollments-main">
                <div className="enrollments-header-section">
                    <h2>Mis Inscripciones</h2>
                    {enrollments.length > 0 && (
                        <button
                            className="explore-subjects-btn"
                            onClick={() => navigate('/student/subjects')}
                        >
                            Explorar más asignaturas
                        </button>
                    )}
                </div>

                {/* Estadísticas */}
                {enrollments.length > 0 && (
                    <div className="enrollment-stats">
                        <div className="stat-card">
                            <h3>{stats.total}</h3>
                            <p>Total Inscripciones</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.paid}</h3>
                            <p>Pagadas</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.pending}</h3>
                            <p>Pago Pendiente</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.failed}</h3>
                            <p>Pago Fallido</p>
                        </div>
                    </div>
                )}

                {cancelStatus && (
                    <div className={`cancel-status ${cancelStatus.includes('exitosamente') ? 'success' : 'error'}`}>
                        {cancelStatus}
                    </div>
                )}

                {loading ? (
                    <div className="loading">Cargando inscripciones...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : enrollments.length === 0 ? (
                    <div className="no-enrollments">
                        <h3>No tienes inscripciones activas</h3>
                        <p>Explora las asignaturas disponibles y encuentra grupos para inscribirte.</p>
                        <button
                            className="explore-btn"
                            onClick={() => navigate('/student/subjects')}
                        >
                            Ver Asignaturas Disponibles
                        </button>
                    </div>
                ) : (
                    <div className="enrollments-grid">
                        {enrollments.map(enrollment => (
                            <div key={enrollment.id} className="enrollment-card">
                                <div className="enrollment-header">
                                    <h3>{enrollment.subjectName}</h3>
                                    {getGroupTypeBadge(enrollment.groupType)}
                                </div>

                                <div className="enrollment-info">
                                    <div className="info-row">
                                        <span className="label">Profesor:</span>
                                        <span className="value">{enrollment.teacherName}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Horario:</span>
                                        <span className="value">{enrollment.schedule || 'Por definir'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Fecha inscripción:</span>
                                        <span className="value">{formatDate(enrollment.enrollmentDate)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Estado de pago:</span>
                                        {getPaymentStatusBadge(enrollment.paymentStatus)}
                                    </div>
                                </div>

                                <div className="enrollment-actions">
                                    {enrollment.paymentStatus === 'PENDING' && (
                                        <>
                                            <button
                                                className="pay-btn"
                                                onClick={() => alert('Sistema de pagos en desarrollo')}
                                            >
                                                Realizar Pago
                                            </button>
                                            <button
                                                className="cancel-btn"
                                                onClick={() => handleCancelEnrollment(enrollment.id)}
                                            >
                                                Cancelar Inscripción
                                            </button>
                                        </>
                                    )}
                                    {enrollment.paymentStatus === 'PAID' && (
                                        <button
                                            className="view-details-btn"
                                            onClick={() => navigate(`/student/groups/${enrollment.groupId}`)}
                                            disabled
                                            title="Funcionalidad en desarrollo"
                                        >
                                            Ver Detalles del Grupo
                                        </button>
                                    )}
                                    {enrollment.paymentStatus === 'FAILED' && (
                                        <button
                                            className="retry-btn"
                                            onClick={() => alert('Sistema de pagos en desarrollo')}
                                        >
                                            Reintentar Pago
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};