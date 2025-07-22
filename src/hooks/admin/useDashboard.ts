// src/hooks/admin/useDashboard.ts
import { useState, useCallback, useEffect } from 'react';
import { dashboardService } from '../../services/admin';
import type { DashboardStats, EnrollmentReport, PaymentReport, StudentReport } from '../../types/admin.types';

interface UseDashboardReturn {
    stats: DashboardStats | null;
    enrollmentReport: EnrollmentReport | null;
    paymentReport: PaymentReport | null;
    studentReport: StudentReport | null;
    loading: boolean;
    error: string | null;

    // Acciones
    fetchDashboardStats: () => Promise<void>;
    fetchEnrollmentReport: (params?: {
        startDate?: string;
        endDate?: string;
        subjectId?: number;
        groupId?: number;
    }) => Promise<void>;
    fetchPaymentReport: (params?: {
        startDate?: string;
        endDate?: string;
        status?: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
    }) => Promise<void>;
    fetchStudentReport: (params?: {
        major?: string;
        year?: number;
        enrollmentStatus?: 'ACTIVO' | 'INACTIVO';
    }) => Promise<void>;
    refreshAll: () => Promise<void>;
}

/**
 * Hook personalizado para el dashboard de administración.
 * Maneja estadísticas generales y reportes del sistema.
 */
export const useDashboard = (): UseDashboardReturn => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [enrollmentReport, setEnrollmentReport] = useState<EnrollmentReport | null>(null);
    const [paymentReport, setPaymentReport] = useState<PaymentReport | null>(null);
    const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener estadísticas del dashboard
    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const dashboardStats = await dashboardService.getDashboardStats();
            setStats(dashboardStats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener reporte de inscripciones
    const fetchEnrollmentReport = useCallback(async (params?: {
        startDate?: string;
        endDate?: string;
        subjectId?: number;
        groupId?: number;
    }) => {
        try {
            setLoading(true);
            setError(null);
            const report = await dashboardService.getEnrollmentReport(params);
            setEnrollmentReport(report);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar reporte de inscripciones');
            console.error('Error fetching enrollment report:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener reporte de pagos
    const fetchPaymentReport = useCallback(async (params?: {
        startDate?: string;
        endDate?: string;
        status?: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
    }) => {
        try {
            setLoading(true);
            setError(null);
            const report = await dashboardService.getPaymentReport(params);
            setPaymentReport(report);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar reporte de pagos');
            console.error('Error fetching payment report:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener reporte de estudiantes
    const fetchStudentReport = useCallback(async (params?: {
        major?: string;
        year?: number;
        enrollmentStatus?: 'ACTIVO' | 'INACTIVO';
    }) => {
        try {
            setLoading(true);
            setError(null);
            const report = await dashboardService.getStudentReport(params);
            setStudentReport(report);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar reporte de estudiantes');
            console.error('Error fetching student report:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refrescar todos los datos
    const refreshAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar todo en paralelo
            await Promise.all([
                fetchDashboardStats(),
                fetchEnrollmentReport(),
                fetchPaymentReport(),
                fetchStudentReport()
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al refrescar datos');
            console.error('Error refreshing all data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchDashboardStats, fetchEnrollmentReport, fetchPaymentReport, fetchStudentReport]);

    // Cargar estadísticas iniciales al montar
    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    return {
        stats,
        enrollmentReport,
        paymentReport,
        studentReport,
        loading,
        error,
        fetchDashboardStats,
        fetchEnrollmentReport,
        fetchPaymentReport,
        fetchStudentReport,
        refreshAll
    };
};