// src/services/admin/subjectManagementService.ts
import { BaseService } from '../baseService';
import type {
    SubjectDto,
    CreateSubjectDto,
    UpdateSubjectDto,
    PageResponse
} from '../../types/admin.types';

/**
 * Servicio para gestión de asignaturas desde el rol de administrador.
 * Permite crear, modificar, eliminar y consultar asignaturas.
 */
class SubjectManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene lista paginada de asignaturas
     */
    async getSubjects(page: number = 0, size: number = 20, sort?: string): Promise<PageResponse<SubjectDto>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(sort && { sort })
        });
        return this.get<PageResponse<SubjectDto>>(`/subjects?${params}`);
    }

    /**
     * Obtiene el detalle de una asignatura
     */
    async getSubjectById(id: number): Promise<SubjectDto> {
        return this.get<SubjectDto>(`/subjects/${id}`);
    }

    /**
     * Crea una nueva asignatura
     */
    async createSubject(data: CreateSubjectDto): Promise<SubjectDto> {
        return this.post<SubjectDto>('/subjects', data);
    }

    /**
     * Actualiza una asignatura existente
     */
    async updateSubject(id: number, data: UpdateSubjectDto): Promise<SubjectDto> {
        return this.put<SubjectDto>(`/subjects/${id}`, data);
    }

    /**
     * Elimina una asignatura
     * Solo posible si no tiene grupos activos
     */
    async deleteSubject(id: number): Promise<void> {
        return this.delete<void>(`/subjects/${id}`);
    }

    /**
     * Busca asignaturas por nombre o código
     */
    async searchSubjects(query: string): Promise<SubjectDto[]> {
        return this.get<SubjectDto[]>(`/subjects/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Obtiene asignaturas por carrera
     */
    async getSubjectsByMajor(major: string): Promise<SubjectDto[]> {
        return this.get<SubjectDto[]>(`/subjects/by-major/${encodeURIComponent(major)}`);
    }

    /**
     * Obtiene asignaturas por año académico
     */
    async getSubjectsByYear(year: number): Promise<SubjectDto[]> {
        return this.get<SubjectDto[]>(`/subjects/by-year/${year}`);
    }

    /**
     * Obtiene grupos de una asignatura
     */
    async getSubjectGroups(subjectId: number): Promise<any[]> {
        return this.get<any[]>(`/subjects/${subjectId}/groups`);
    }

    /**
     * Verifica si el código de asignatura ya existe
     */
    async checkCodeExists(code: string): Promise<boolean> {
        try {
            const response = await this.get<{ exists: boolean }>(`/subjects/check-code?code=${encodeURIComponent(code)}`);
            return response.exists;
        } catch {
            return false;
        }
    }

    /**
     * Obtiene estadísticas de asignaturas
     */
    async getSubjectStats(): Promise<{
        total: number;
        byMajor: Record<string, number>;
        byYear: Record<number, number>;
        withActiveGroups: number;
    }> {
        return this.get('/subjects/stats');
    }

    /**
     * Importa asignaturas desde CSV
     */
    async importSubjects(file: File): Promise<{
        imported: number;
        errors: string[];
    }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.post('/subjects/import', formData);
    }
}

// Exportar instancia única
export const subjectManagementService = new SubjectManagementService();