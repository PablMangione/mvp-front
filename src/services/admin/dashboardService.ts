// src/services/admin/dashboardService.ts
import { BaseService } from '../baseService';
import type {
    DashboardStats,
    EnrollmentReport,
    PaymentReport,
    StudentReport
} from '../../types/admin.types';

/**
 * Servicio para el dashboard de administración y generación de reportes.
 * Proporciona estadísticas generales y reportes del sistema.
 */
class DashboardService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene estadísticas generales del dashboard
     */
    async getDashboardStats(): Promise<DashboardStats> {
        return this.get<DashboardStats>('/stats/dashboard');
    }

    /**
     * Obtiene reporte de inscripciones
     */
    async getEnrollmentReport(params?: {
        startDate?: string;
        endDate?: string;
        subjectId?: number;
        groupId?: number;
    }): Promise<EnrollmentReport> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        return this.get<EnrollmentReport>(`/reports/enrollments?${queryParams}`);
    }

    /**
     * Obtiene reporte de pagos
     */
    async getPaymentReport(params?: {
        startDate?: string;
        endDate?: string;
        status?: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
    }): Promise<PaymentReport> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        return this.get<PaymentReport>(`/reports/payments?${queryParams}`);
    }

    /**
     * Obtiene reporte de estudiantes
     */
    async getStudentReport(params?: {
        major?: string;
        year?: number;
        enrollmentStatus?: 'ACTIVO' | 'INACTIVO';
    }): Promise<StudentReport> {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        return this.get<StudentReport>(`/reports/students?${queryParams}`);
    }

    /**
     * Obtiene tendencias de inscripciones
     */
    async getEnrollmentTrends(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<{
        labels: string[];
        data: number[];
    }> {
        return this.get(`/stats/enrollment-trends?period=${period}`);
    }

    /**
     * Obtiene ocupación de grupos
     */
    async getGroupOccupancy(): Promise<{
        groupId: number;
        groupName: string;
        capacity: number;
        enrolled: number;
        percentage: number;
    }[]> {
        return this.get('/stats/group-occupancy');
    }

    /**
     * Obtiene actividad reciente del sistema
     */
    async getRecentActivity(limit: number = 20): Promise<{
        id: number;
        type: 'ENROLLMENT' | 'CANCELLATION' | 'GROUP_REQUEST' | 'USER_REGISTRATION';
        description: string;
        timestamp: string;
        userId?: number;
        userName?: string;
    }[]> {
        return this.get(`/stats/recent-activity?limit=${limit}`);
    }

    /**
     * Obtiene alertas del sistema
     */
    async getSystemAlerts(): Promise<{
        id: number;
        type: 'WARNING' | 'ERROR' | 'INFO';
        message: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        timestamp: string;
        resolved: boolean;
    }[]> {
        return this.get('/stats/alerts');
    }

    /**
     * Genera reporte personalizado
     */
    async generateCustomReport(config: {
        reportType: string;
        filters: Record<string, any>;
        format: 'PDF' | 'EXCEL' | 'CSV';
    }): Promise<Blob> {
        const response = await this.post('/reports/custom', config);
        return response as unknown as Blob;
    }

    /**
     * Programa un reporte recurrente
     */
    async scheduleReport(config: {
        reportType: string;
        frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        recipients: string[];
        filters?: Record<string, any>;
    }): Promise<{
        id: number;
        message: string;
    }> {
        return this.post('/reports/schedule', config);
    }
}

// Exportar instancia única
export const dashboardService = new DashboardService();