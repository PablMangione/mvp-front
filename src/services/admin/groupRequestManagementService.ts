// src/services/admin/groupRequestManagementService.ts
import { BaseService } from '../baseService';
import type {
    GroupRequestDto,
    UpdateRequestStatusDto,
    PageResponse
} from '../../types/admin.types';

/**
 * Servicio para gestión de solicitudes de grupos desde el rol de administrador.
 * Permite aprobar, rechazar y consultar solicitudes de estudiantes.
 */
class GroupRequestManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene lista paginada de solicitudes de grupo
     */
    async getGroupRequests(
        page: number = 0,
        size: number = 20,
        sort?: string,
        status?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
    ): Promise<PageResponse<GroupRequestDto>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(sort && { sort }),
            ...(status && { status })
        });
        return this.get<PageResponse<GroupRequestDto>>(`/group-requests?${params}`);
    }

    /**
     * Obtiene el detalle de una solicitud
     */
    async getRequestById(id: number): Promise<GroupRequestDto> {
        return this.get<GroupRequestDto>(`/group-requests/${id}`);
    }

    /**
     * Actualiza el estado de una solicitud (aprobar/rechazar)
     */
    async updateRequestStatus(id: number, data: UpdateRequestStatusDto): Promise<GroupRequestDto> {
        return this.put<GroupRequestDto>(`/group-requests/${id}/status`, data);
    }

    /**
     * Aprueba una solicitud y crea el grupo si es necesario
     */
    async approveRequest(id: number, comment?: string): Promise<GroupRequestDto> {
        return this.updateRequestStatus(id, {
            status: 'APROBADA',
            adminComment: comment
        });
    }

    /**
     * Rechaza una solicitud
     */
    async rejectRequest(id: number, reason: string): Promise<GroupRequestDto> {
        return this.updateRequestStatus(id, {
            status: 'RECHAZADA',
            adminComment: reason
        });
    }

    /**
     * Obtiene solicitudes pendientes
     */
    async getPendingRequests(): Promise<GroupRequestDto[]> {
        return this.get<GroupRequestDto[]>('/group-requests/pending');
    }

    /**
     * Obtiene solicitudes por estudiante
     */
    async getRequestsByStudent(studentId: number): Promise<GroupRequestDto[]> {
        return this.get<GroupRequestDto[]>(`/group-requests/by-student/${studentId}`);
    }

    /**
     * Obtiene solicitudes por asignatura
     */
    async getRequestsBySubject(subjectId: number): Promise<GroupRequestDto[]> {
        return this.get<GroupRequestDto[]>(`/group-requests/by-subject/${subjectId}`);
    }

    /**
     * Procesa múltiples solicitudes en lote
     */
    async processBatchRequests(data: {
        requestIds: number[];
        action: 'APROBAR' | 'RECHAZAR';
        comment?: string;
    }): Promise<{
        processed: number;
        errors: string[];
    }> {
        return this.post('/group-requests/batch-process', data);
    }

    /**
     * Obtiene estadísticas de solicitudes
     */
    async getRequestStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        averageProcessingTime: number;
        bySubject: Record<string, number>;
    }> {
        return this.get('/group-requests/stats');
    }

    /**
     * Exporta reporte de solicitudes
     */
    async exportRequests(filters?: any): Promise<Blob> {
        const params = new URLSearchParams(filters);
        const response = await this.get(`/group-requests/export?${params}`);
        return response as unknown as Blob;
    }
}

// Exportar instancia única
export const groupRequestManagementService = new GroupRequestManagementService();