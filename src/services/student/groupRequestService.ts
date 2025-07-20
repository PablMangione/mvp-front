// src/services/student/groupRequestService.ts
import { BaseService } from '../baseService';
import type {
    GroupRequest,
    CreateGroupRequest,
    GroupRequestResponse
} from '../../types/student.types';

/**
 * Servicio para gestión de solicitudes de grupo.
 */
class GroupRequestService extends BaseService {
    constructor() {
        super('/students/group-requests');
    }

    /**
     * Crea una nueva solicitud de grupo
     */
    async createGroupRequest(data: CreateGroupRequest): Promise<GroupRequestResponse> {
        return this.post<GroupRequestResponse>('/create', data);
    }

    /**
     * Obtiene todas las solicitudes del estudiante
     */
    async getMyGroupRequests(): Promise<GroupRequest[]> {
        return this.get<GroupRequest[]>('/get');
    }

    /**
     * Verifica si el estudiante puede solicitar un grupo para una asignatura
     */
    async canRequestGroup(subjectId: number): Promise<boolean> {
        return this.get<boolean>(`/can-request/${subjectId}`);
    }

    /**
     * Obtiene el detalle de una solicitud específica
     */
    async getRequestDetail(requestId: number): Promise<GroupRequest> {
        return this.get<GroupRequest>(`/${requestId}`);
    }

    /**
     * Cancela una solicitud pendiente
     */
    async cancelRequest(requestId: number): Promise<void> {
        return this.delete<void>(`/${requestId}`);
    }

    /**
     * Obtiene estadísticas de las solicitudes del estudiante
     */
    async getRequestStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }> {
        return this.get('/stats');
    }
}

// Exportar instancia única
export const groupRequestService = new GroupRequestService();