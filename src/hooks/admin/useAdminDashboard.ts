// src/hooks/admin/useAdminDashboard.ts
import { useState, useEffect } from 'react';
import {
    studentManagementService,
    teacherManagementService,
    subjectManagementService,
    groupManagementService,
    groupRequestManagementService
} from '../../services/admin';
import type { GroupRequestDto } from '../../types/admin.types';

/**
 * Tipos para las estadísticas del dashboard.
 * Estas interfaces definen la estructura de datos que mostraremos
 * en las tarjetas de estadísticas del dashboard.
 */
interface DashboardStats {
    students: {
        total: number;
        newThisMonth: number;
        activePercentage: number;
    };
    teachers: {
        total: number;
        withActiveGroups: number;
        averageGroupsPerTeacher: number;
    };
    subjects: {
        total: number;
        byMajor: Record<string, number>;
        withoutGroups: number;
    };
    groups: {
        total: number;
        active: number;
        planned: number;
        closed: number;
        totalCapacity: number;
        totalEnrolled: number;
    };
    requests: {
        pending: number;
        approvedThisWeek: number;
        rejectedThisWeek: number;
    };
}

/**
 * Hook personalizado para el dashboard administrativo.
 *
 * Este hook centraliza toda la lógica de obtención y procesamiento de datos
 * para el dashboard. Maneja:
 * - Carga inicial de todas las estadísticas
 * - Gestión de estados de carga y error
 * - Cálculo de métricas derivadas
 * - Actualización de datos
 *
 * La separación de esta lógica del componente visual nos permite:
 * 1. Reutilizar la lógica si necesitamos otro tipo de dashboard
 * 2. Testear la lógica de forma aislada
 * 3. Mantener el componente visual limpio y enfocado en la presentación
 */
export const useAdminDashboard = () => {
    // Estado principal para las estadísticas
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Estado para las solicitudes pendientes (las mostramos por separado)
    const [pendingRequests, setPendingRequests] = useState<GroupRequestDto[]>([]);

    // Estados de carga y error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para controlar actualizaciones parciales
    const [refreshing, setRefreshing] = useState(false);

    /**
     * Carga todas las estadísticas del dashboard.
     *
     * Esta función realiza múltiples llamadas a la API en paralelo
     * para obtener todos los datos necesarios. Usamos Promise.all
     * para optimizar el tiempo de carga.
     */
    const fetchDashboardData = async () => {
        try {
            setError(null);

            // Obtenemos todos los datos en paralelo para mejor performance
            const [
                studentsPage,
                teachersPage,
                subjects,
                pendingRequestsList
            ] = await Promise.all([
                studentManagementService.getAllStudents({ page: 0, size: 1 }), // Solo necesitamos el total
                teacherManagementService.getAllTeachers({ page: 0, size: 1 }), // Solo necesitamos el total
                subjectManagementService.getAllSubjects(),
                groupRequestManagementService.getPendingRequests()
            ]);

            // Para grupos, necesitamos obtener todos para calcular estadísticas detalladas
            // En un sistema real, esto vendría de un endpoint específico de estadísticas
            const allGroups = await fetchAllGroups();

            // Calcular estadísticas de estudiantes
            const studentStats = {
                total: studentsPage.totalElements,
                newThisMonth: calculateNewThisMonth(studentsPage.totalElements), // Simulado
                activePercentage: 85 // En producción vendría del backend
            };

            // Calcular estadísticas de profesores
            const teacherStats = {
                total: teachersPage.totalElements,
                withActiveGroups: countTeachersWithActiveGroups(allGroups),
                averageGroupsPerTeacher: calculateAverageGroupsPerTeacher(allGroups, teachersPage.totalElements)
            };

            // Calcular estadísticas de asignaturas
            const subjectStats = {
                total: subjects.length,
                byMajor: groupSubjectsByMajor(subjects),
                withoutGroups: countSubjectsWithoutGroups(subjects, allGroups)
            };

            // Calcular estadísticas de grupos
            const groupStats = {
                total: allGroups.length,
                active: allGroups.filter(g => g.status === 'ACTIVE').length,
                planned: allGroups.filter(g => g.status === 'PLANNED').length,
                closed: allGroups.filter(g => g.status === 'CLOSED').length,
                totalCapacity: allGroups.reduce((sum, g) => sum + g.maxCapacity, 0),
                totalEnrolled: allGroups.reduce((sum, g) => sum + g.enrolledStudents, 0)
            };

            // Calcular estadísticas de solicitudes
            const requestStats = {
                pending: pendingRequestsList.length,
                approvedThisWeek: 12, // En producción vendría del backend
                rejectedThisWeek: 3   // En producción vendría del backend
            };

            // Actualizar todos los estados
            setStats({
                students: studentStats,
                teachers: teacherStats,
                subjects: subjectStats,
                groups: groupStats,
                requests: requestStats
            });

            setPendingRequests(pendingRequestsList);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar los datos del dashboard. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Obtiene todos los grupos del sistema.
     * En un sistema real, esto debería ser un endpoint paginado o
     * un endpoint específico que devuelva solo estadísticas.
     */
    const fetchAllGroups = async () => {
        try {
            // Como no tenemos un endpoint para obtener todos los grupos directamente,
            // obtenemos los grupos de cada asignatura
            const subjects = await subjectManagementService.getAllSubjects();
            const allGroupsPromises = subjects.map(subject =>
                groupManagementService.getGroupsBySubject(subject.id)
            );

            const groupsArrays = await Promise.all(allGroupsPromises);
            return groupsArrays.flat(); // Aplanar el array de arrays
        } catch (error) {
            console.error('Error fetching all groups:', error);
            return [];
        }
    };

    /**
     * Funciones auxiliares para calcular estadísticas derivadas
     */

    const calculateNewThisMonth = (total: number): number => {
        // En producción, esto vendría del backend basado en fechas reales
        // Por ahora simulamos un 10% de crecimiento mensual
        return Math.floor(total * 0.1);
    };

    const countTeachersWithActiveGroups = (groups: any[]): number => {
        const teachersWithGroups = new Set(
            groups
                .filter(g => g.status === 'ACTIVE' && g.teacherId)
                .map(g => g.teacherId)
        );
        return teachersWithGroups.size;
    };

    const calculateAverageGroupsPerTeacher = (groups: any[], totalTeachers: number): number => {
        if (totalTeachers === 0) return 0;
        const groupsWithTeacher = groups.filter(g => g.teacherId).length;
        return Number((groupsWithTeacher / totalTeachers).toFixed(1));
    };

    const groupSubjectsByMajor = (subjects: any[]): Record<string, number> => {
        return subjects.reduce((acc, subject) => {
            acc[subject.major] = (acc[subject.major] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    };

    const countSubjectsWithoutGroups = (subjects: any[], groups: any[]): number => {
        const subjectsWithGroups = new Set(groups.map(g => g.subjectId));
        return subjects.filter(s => !subjectsWithGroups.has(s.id)).length;
    };

    /**
     * Efecto para cargar datos al montar el componente
     */
    useEffect(() => {
        fetchDashboardData();
    }, []);

    /**
     * Función para refrescar los datos del dashboard
     */
    const refresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    /**
     * Función para aprobar una solicitud rápidamente desde el dashboard
     */
    const quickApproveRequest = async (requestId: number) => {
        try {
            await groupRequestManagementService.updateRequestStatus(requestId, {
                status: 'APPROVED',
                adminComments: 'Aprobado desde el dashboard'
            });

            // Recargar las solicitudes pendientes
            await refresh();
            return true;
        } catch (error) {
            console.error('Error approving request:', error);
            return false;
        }
    };

    /**
     * Calcula el porcentaje de ocupación de los grupos activos
     */
    const getOccupancyRate = (): number => {
        if (!stats || stats.groups.totalCapacity === 0) return 0;
        return Math.round((stats.groups.totalEnrolled / stats.groups.totalCapacity) * 100);
    };

    /**
     * Obtiene las carreras con más asignaturas
     */
    const getTopMajors = (): Array<{ name: string; count: number }> => {
        if (!stats) return [];

        return Object.entries(stats.subjects.byMajor)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 carreras
    };

    return {
        // Estado
        stats,
        pendingRequests,
        loading,
        refreshing,
        error,

        // Acciones
        refresh,
        quickApproveRequest,

        // Valores calculados
        occupancyRate: getOccupancyRate(),
        topMajors: getTopMajors(),

        // Flags útiles
        hasData: !loading && !error && stats !== null,
        hasPendingRequests: pendingRequests.length > 0
    };
};