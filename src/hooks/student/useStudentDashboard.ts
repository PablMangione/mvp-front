// src/hooks/student/useStudentDashboard.ts
import { useState, useEffect } from 'react';
import { studentService, groupRequestService } from '../../services/student';
import type { StudentStats, GroupRequestStats } from '../../types/student.types';

/**
 * Hook personalizado para el dashboard del estudiante.
 * Extrae toda la lógica del componente Dashboard actual.
 */
export const useStudentDashboard = () => {
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [groupRequestStats, setGroupRequestStats] = useState<GroupRequestStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener estadísticas del estudiante
            const [statsData, requestsData] = await Promise.all([
                studentService.getStats(),
                groupRequestService.getMyGroupRequests()
            ]);

            setStats(statsData);

            // Calcular estadísticas de solicitudes
            const requestStats: GroupRequestStats = {
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

    // Cargar datos al montar
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Función para refrescar datos
    const refresh = () => {
        fetchDashboardData();
    };

    return {
        // Estado
        stats,
        groupRequestStats,
        loading,
        error,

        // Acciones
        refresh,

        // Valores computados (para conveniencia)
        hasActiveEnrollments: stats ? stats.activeEnrollments > 0 : false,
        hasPendingRequests: groupRequestStats.pending > 0,
    };
};