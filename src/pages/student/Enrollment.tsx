// src/pages/student/Enrollment.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentService } from '../../services/student';
import { EnrollmentCard } from '../../components/student/EnrollmentCard';
import { StatsCard } from '../../components/student/StatsCard';
import type { EnrollmentSummary } from '../../types/student.types';
import './Enrollment.css';

/**
 * Página de inscripciones - REFACTORIZADA con componentes reutilizables
 */
export const Enrollments: React.FC = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelStatus, setCancelStatus] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

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
            setCancellingId(enrollmentId);
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
        } finally {
            setCancellingId(null);
        }
    };

    const handlePayment = async (enrollmentId: number) => {
        // TODO: Implementar lógica de pago
        console.log('Iniciar proceso de pago para inscripción:', enrollmentId);
        alert('Función de pago en desarrollo');
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

                {/* Estadísticas de inscripciones usando StatsCard */}
                {enrollments.length > 0 && (
                    <div className="stats-card-grid">
                        <StatsCard
                            title="Total Inscripciones"
                            value={stats.total}
                            description="Grupos en los que estás inscrito"
                            icon="📚"
                        />
                        <StatsCard
                            title="Pagadas"
                            value={stats.paid}
                            description="Inscripciones pagadas"
                            icon="✅"
                        />
                        <StatsCard
                            title="Pago Pendiente"
                            value={stats.pending}
                            description="Requieren pago"
                            icon="⏳"
                            actionLabel={stats.pending > 0 ? "Ver pendientes" : undefined}
                            onClick={stats.pending > 0 ? () => {
                                const pendingSection = document.getElementById('pending-enrollments');
                                pendingSection?.scrollIntoView({ behavior: 'smooth' });
                            } : undefined}
                        />
                        {stats.failed > 0 && (
                            <StatsCard
                                title="Pago Fallido"
                                value={stats.failed}
                                description="Requieren atención"
                                icon="❌"
                            />
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
                    <>
                        {/* Inscripciones con pago pendiente */}
                        {stats.pending > 0 && (
                            <section id="pending-enrollments" className="enrollments-section">
                                <h3 className="section-title">⏳ Pagos Pendientes</h3>
                                <div className="enrollments-grid">
                                    {enrollments
                                        .filter(e => e.paymentStatus === 'PENDING')
                                        .map(enrollment => (
                                            <EnrollmentCard
                                                key={enrollment.id}
                                                enrollment={enrollment}
                                                onCancel={handleCancelEnrollment}
                                                onPay={handlePayment}
                                                isProcessing={cancellingId === enrollment.id}
                                            />
                                        ))}
                                </div>
                            </section>
                        )}

                        {/* Inscripciones pagadas */}
                        {stats.paid > 0 && (
                            <section className="enrollments-section">
                                <h3 className="section-title">✅ Inscripciones Activas</h3>
                                <div className="enrollments-grid">
                                    {enrollments
                                        .filter(e => e.paymentStatus === 'PAID')
                                        .map(enrollment => (
                                            <EnrollmentCard
                                                key={enrollment.id}
                                                enrollment={enrollment}
                                                onCancel={handleCancelEnrollment}
                                                isProcessing={cancellingId === enrollment.id}
                                            />
                                        ))}
                                </div>
                            </section>
                        )}

                        {/* Inscripciones con pago fallido */}
                        {stats.failed > 0 && (
                            <section className="enrollments-section">
                                <h3 className="section-title">❌ Pagos Fallidos</h3>
                                <div className="enrollments-grid">
                                    {enrollments
                                        .filter(e => e.paymentStatus === 'FAILED')
                                        .map(enrollment => (
                                            <EnrollmentCard
                                                key={enrollment.id}
                                                enrollment={enrollment}
                                                onCancel={handleCancelEnrollment}
                                                onPay={handlePayment}
                                                isProcessing={cancellingId === enrollment.id}
                                            />
                                        ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};