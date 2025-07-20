// src/pages/student/Enrollment.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentService } from '../../services/student';
import type { EnrollmentSummary } from '../../types/student.types';
import './Enrollment.css';

/**
 * Página de inscripciones - REFACTORIZADA
 * Removido: header, nav y logout (ahora en StudentLayout)
 */
export const Enrollments: React.FC = () => {
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
            const data = await enrollmentService.getMyEnrollments();
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
            await enrollmentService.cancelEnrollment(enrollmentId);
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

    if (loading) {
        return (
            <div className="enrollments-container">
                <div className="loading">Cargando inscripciones...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="enrollments-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="enrollments-container">
            <div className="enrollments-content">
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

                {/* Estadísticas de inscripciones */}
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
                        {stats.failed > 0 && (
                            <div className="stat-card">
                                <h3>{stats.failed}</h3>
                                <p>Pago Fallido</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Mensaje de estado */}
                {cancelStatus && (
                    <div className={`cancel-status ${cancelStatus.includes('Error') ? 'error' : 'success'}`}>
                        {cancelStatus}
                    </div>
                )}

                {/* Lista de inscripciones */}
                {enrollments.length === 0 ? (
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
                                        <span className="value">{enrollment.schedule}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Fecha de inscripción:</span>
                                        <span className="value">{formatDate(enrollment.enrollmentDate)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Estado de pago:</span>
                                        {getPaymentStatusBadge(enrollment.paymentStatus)}
                                    </div>
                                </div>

                                <div className="enrollment-actions">
                                    {enrollment.paymentStatus === 'PENDING' && (
                                        <button className="pay-button">
                                            Pagar Ahora
                                        </button>
                                    )}
                                    <button
                                        className="cancel-button"
                                        onClick={() => handleCancelEnrollment(enrollment.id)}
                                    >
                                        Cancelar Inscripción
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};