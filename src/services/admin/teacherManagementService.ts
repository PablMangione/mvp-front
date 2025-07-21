// src/services/admin/teacherManagementService.ts
import { BaseService } from '../baseService';
import type {
    TeacherDto,
    CreateTeacherDto,
    PageResponse
} from '../../types/admin.types';

/**
 * Servicio para gestión de profesores desde el rol de administrador.
 * Permite alta, baja, modificación y consulta de profesores.
 */
class TeacherManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene lista paginada de profesores
     */
    async getTeachers(page: number = 0, size: number = 20, sort?: string): Promise<PageResponse<TeacherDto>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(sort && { sort })
        });
        return this.get<PageResponse<TeacherDto>>(`/teachers?${params}`);
    }

    /**
     * Obtiene el detalle de un profesor específico
     */
    async getTeacherById(id: number): Promise<TeacherDto> {
        return this.get<TeacherDto>(`/teachers/${id}`);
    }

    /**
     * Crea un nuevo profesor (Alta)
     */
    async createTeacher(data: CreateTeacherDto): Promise<TeacherDto> {
        return this.post<TeacherDto>('/teachers', data);
    }

    /**
     * Actualiza datos de un profesor
     */
    async updateTeacher(id: number, data: Partial<CreateTeacherDto>): Promise<TeacherDto> {
        return this.put<TeacherDto>(`/teachers/${id}`, data);
    }

    /**
     * Elimina un profesor (Baja)
     * Solo posible si no tiene grupos activos asignados
     */
    async deleteTeacher(id: number): Promise<void> {
        return this.delete<void>(`/teachers/${id}`);
    }

    /**
     * Busca profesores por término
     */
    async searchTeachers(query: string): Promise<TeacherDto[]> {
        return this.get<TeacherDto[]>(`/teachers/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Obtiene profesores disponibles para asignar a grupos
     */
    async getAvailableTeachers(): Promise<TeacherDto[]> {
        return this.get<TeacherDto[]>('/teachers/available');
    }

    /**
     * Obtiene grupos asignados a un profesor
     */
    async getTeacherGroups(teacherId: number): Promise<any[]> {
        return this.get<any[]>(`/teachers/${teacherId}/groups`);
    }

    /**
     * Obtiene estadísticas de profesores
     */
    async getTeacherStats(): Promise<{
        total: number;
        withActiveGroups: number;
        averageGroupsPerTeacher: number;
    }> {
        return this.get('/teachers/stats');
    }

    /**
     * Verifica si un email ya está registrado
     */
    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const response = await this.get<{ exists: boolean }>(`/teachers/check-email?email=${encodeURIComponent(email)}`);
            return response.exists;
        } catch {
            return false;
        }
    }

    /**
     * Obtiene el horario de un profesor
     */
    async getTeacherSchedule(teacherId: number): Promise<any> {
        return this.get(`/teachers/${teacherId}/schedule`);
    }
}

// Exportar instancia única
export const teacherManagementService = new TeacherManagementService();