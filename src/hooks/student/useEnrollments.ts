// src/hooks/student/useEnrollments.ts
import { useState, useEffect, useMemo } from 'react';
import { enrollmentService } from '../../services/student';
import type { EnrollmentSummary } from '../../types/student.types';

interface EnrollmentStats {
    total: number;
    paid: number;
    pending: number;
    failed: number;
}

/**
 * Hook personalizado para gestionar las inscripciones del estudiante.
 *
 * Funcionalidades:
 * - Carga y gestión de inscripciones
 * - Cancelación de inscripciones
 * - Estadísticas calculadas
 * - Formateo de datos
 */
export const useEnrollments = () => {
    // Estado principal
    const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState<number | null>(null);

    // Estados de error y feedback
    const [error, setError] = useState<string | null>(null);
    const [cancelStatus, setCancelStatus] = useState<string | null>(null);

    // Cargar inscripciones al montar
    useEffect(() => {
        fetchEnrollments();
    }, []);

    // Fetch inscripciones
    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await enrollmentService.getMyEnrollments();
            setEnrollments(data);
            console.log('Enrollments cargados', data);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            setError('Error al cargar las inscripciones');
        } finally {
            setLoading(false);
        }
    };

    // Cancelar inscripción
    const cancelEnrollment = async (enrollmentId: number) => {
        try {
            console.log('Canceling enrollment:', enrollmentId);
            setCancelling(enrollmentId);
            setCancelStatus('Cancelando inscripción...');

            await enrollmentService.cancelEnrollment(enrollmentId);

            setCancelStatus('Inscripción cancelada exitosamente');

            // Recargar las inscripciones
            await fetchEnrollments();

            setTimeout(() => setCancelStatus(null), 3000);
            return true;

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cancelar la inscripción';
            setCancelStatus(errorMessage);
            setTimeout(() => setCancelStatus(null), 5000);
            return false;
        } finally {
            setCancelling(null);
        }
    };

    // Calcular estadísticas (memoizado)
    const stats: EnrollmentStats = useMemo(() => {
        return {
            total: enrollments.length,
            paid: enrollments.filter(e => e.paymentStatus === 'PAID').length,
            pending: enrollments.filter(e => e.paymentStatus === 'PENDING').length,
            failed: enrollments.filter(e => e.paymentStatus === 'FAILED').length
        };
    }, [enrollments]);

    // Formatear fecha
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Obtener badge de estado de pago
    const getPaymentStatusInfo = (status: string) => {
        switch (status) {
            case 'PAID':
                return { label: 'Pagado', className: 'paid', color: '#27ae60' };
            case 'PENDING':
                return { label: 'Pendiente', className: 'pending', color: '#f39c12' };
            case 'FAILED':
                return { label: 'Fallido', className: 'failed', color: '#e74c3c' };
            default:
                return { label: status, className: '', color: '#7f8c8d' };
        }
    };

    // Obtener info del tipo de grupo
    const getGroupTypeInfo = (type: string) => {
        return type === 'REGULAR'
            ? { label: 'Regular', className: 'regular', color: '#3498db' }
            : { label: 'Intensivo', className: 'intensive', color: '#9b59b6' };
    };

    // Verificar si se puede cancelar una inscripción
    const canCancelEnrollment = (enrollment: EnrollmentSummary): boolean => {
        // Aquí se pueden agregar más reglas de negocio
        // Por ejemplo: no permitir cancelar si ya pasó cierta fecha
        return true;
    };

    // Filtrar inscripciones por estado
    const filterByPaymentStatus = (status?: string) => {
        if (!status) return enrollments;
        return enrollments.filter(e => e.paymentStatus === status);
    };

    // Ordenar inscripciones
    const sortEnrollments = (by: 'date' | 'subject' | 'status' = 'date') => {
        const sorted = [...enrollments];
        switch (by) {
            case 'date':
                return sorted.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            case 'subject':
                return sorted.sort((a, b) =>
                    a.subjectName.localeCompare(b.subjectName)
                );
            case 'status':
                return sorted.sort((a, b) =>
                    a.paymentStatus.localeCompare(b.paymentStatus)
                );
            default:
                return sorted;
        }
    };

    return {
        // Estado
        enrollments,
        loading,
        cancelling,
        error,
        cancelStatus,
        stats,

        // Acciones
        cancelEnrollment,
        refresh: fetchEnrollments,

        // Utilidades
        formatDate,
        getPaymentStatusInfo,
        getGroupTypeInfo,
        canCancelEnrollment,
        filterByPaymentStatus,
        sortEnrollments,

        // Computed
        hasEnrollments: enrollments.length > 0,
        hasPendingPayments: stats.pending > 0,
        hasFailedPayments: stats.failed > 0
    };
};