// src/services/admin/groupManagementService.ts
import { BaseService } from '../baseService';
import type {
    CourseGroupDto,
    CreateGroupDto,
    UpdateGroupDto,
    UpdateGroupStatusDto,
    AssignTeacherDto,
    PageResponse
} from '../../types/admin.types';

/**
 * Servicio para gestión de grupos desde el rol de administrador.
 * Permite crear, modificar, eliminar grupos y cambiar su estado.
 */
class GroupManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene lista paginada de grupos
     */
    async getGroups(page: number = 0, size: number = 20, sort?: string): Promise<PageResponse<CourseGroupDto>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(sort && { sort })
        });
        return this.get<PageResponse<CourseGroupDto>>(`/groups?${params}`);
    }

    /**
     * Obtiene el detalle de un grupo
     */
    async getGroupById(id: number): Promise<CourseGroupDto> {
        return this.get<CourseGroupDto>(`/groups/${id}`);
    }

    /**
     * Crea un nuevo grupo
     */
    async createGroup(data: CreateGroupDto): Promise<CourseGroupDto> {
        return this.post<CourseGroupDto>('/groups', data);
    }

    /**
     * Actualiza un grupo existente
     */
    async updateGroup(id: number, data: UpdateGroupDto): Promise<CourseGroupDto> {
        return this.put<CourseGroupDto>(`/groups/${id}`, data);
    }

    /**
     * Cambia el estado de un grupo (PLANIFICADO → ACTIVO → CERRADO)
     */
    async updateGroupStatus(id: number, data: UpdateGroupStatusDto): Promise<CourseGroupDto> {
        return this.put<CourseGroupDto>(`/groups/${id}/status`, data);
    }

    /**
     * Asigna un profesor a un grupo
     */
    async assignTeacher(groupId: number, data: AssignTeacherDto): Promise<CourseGroupDto> {
        return this.put<CourseGroupDto>(`/groups/${groupId}/assign-teacher`, data);
    }

    /**
     * Elimina un grupo
     * Solo posible si no tiene estudiantes inscritos
     */
    async deleteGroup(id: number): Promise<void> {
        return this.delete<void>(`/groups/${id}`);
    }

    /**
     * Busca grupos por término
     */
    async searchGroups(query: string): Promise<CourseGroupDto[]> {
        return this.get<CourseGroupDto[]>(`/groups/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Obtiene grupos por asignatura
     */
    async getGroupsBySubject(subjectId: number): Promise<CourseGroupDto[]> {
        return this.get<CourseGroupDto[]>(`/groups/by-subject/${subjectId}`);
    }

    /**
     * Obtiene grupos por profesor
     */
    async getGroupsByTeacher(teacherId: number): Promise<CourseGroupDto[]> {
        return this.get<CourseGroupDto[]>(`/groups/by-teacher/${teacherId}`);
    }

    /**
     * Obtiene grupos por estado
     */
    async getGroupsByStatus(status: 'PLANIFICADO' | 'ACTIVO' | 'CERRADO'): Promise<CourseGroupDto[]> {
        return this.get<CourseGroupDto[]>(`/groups/by-status/${status}`);
    }

    /**
     * Obtiene estudiantes inscritos en un grupo
     */
    async getGroupStudents(groupId: number): Promise<any[]> {
        return this.get<any[]>(`/groups/${groupId}/students`);
    }

    /**
     * Obtiene estadísticas de grupos
     */
    async getGroupStats(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        averageOccupancy: number;
        withWaitingList: number;
    }> {
        return this.get('/groups/stats');
    }

    /**
     * Clona un grupo existente
     */
    async cloneGroup(groupId: number): Promise<CourseGroupDto> {
        return this.post<CourseGroupDto>(`/groups/${groupId}/clone`);
    }

    /**
     * Exporta horario de grupos
     */
    async exportSchedule(format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
        const response = await this.get(`/groups/export-schedule?format=${format}`);
        return response as unknown as Blob;
    }
}

// Exportar instancia única
export const groupManagementService = new GroupManagementService();