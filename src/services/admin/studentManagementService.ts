// src/services/admin/studentManagementService.ts
import { BaseService } from '../baseService';
import type {
    StudentDto,
    CreateStudentDto,
    PageResponse
} from '../../types/admin.types';

/**
 * Servicio para gestión de estudiantes desde el rol de administrador.
 * Permite alta, baja, modificación y consulta de estudiantes.
 */
class StudentManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene lista paginada de estudiantes
     */
    async getStudents(page: number = 0, size: number = 20, sort?: string): Promise<PageResponse<StudentDto>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(sort && { sort })
        });
        return this.get<PageResponse<StudentDto>>(`/students?${params}`);
    }

    /**
     * Obtiene el detalle de un estudiante específico
     */
    async getStudentById(id: number): Promise<StudentDto> {
        return this.get<StudentDto>(`/students/${id}`);
    }

    /**
     * Crea un nuevo estudiante (Alta)
     */
    async createStudent(data: CreateStudentDto): Promise<StudentDto> {
        return this.post<StudentDto>('/students', data);
    }

    /**
     * Actualiza datos de un estudiante
     */
    async updateStudent(id: number, data: Partial<CreateStudentDto>): Promise<StudentDto> {
        return this.put<StudentDto>(`/students/${id}`, data);
    }

    /**
     * Elimina un estudiante (Baja)
     */
    async deleteStudent(id: number): Promise<void> {
        return this.delete<void>(`/students/${id}`);
    }

    /**
     * Busca estudiantes por término
     */
    async searchStudents(query: string): Promise<StudentDto[]> {
        return this.get<StudentDto[]>(`/students/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Obtiene estudiantes por carrera
     */
    async getStudentsByMajor(major: string): Promise<StudentDto[]> {
        return this.get<StudentDto[]>(`/students/by-major/${encodeURIComponent(major)}`);
    }

    /**
     * Obtiene estadísticas de estudiantes
     */
    async getStudentStats(): Promise<{
        total: number;
        byMajor: Record<string, number>;
        activeEnrollments: number;
    }> {
        return this.get('/students/stats');
    }

    /**
     * Verifica si un email ya está registrado
     */
    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const response = await this.get<{ exists: boolean }>(`/students/check-email?email=${encodeURIComponent(email)}`);
            return response.exists;
        } catch {
            return false;
        }
    }

    /**
     * Exporta lista de estudiantes a CSV
     */
    async exportStudents(filters?: any): Promise<Blob> {
        const params = new URLSearchParams(filters);
        const response = await this.get(`/students/export?${params}`);
        return response as unknown as Blob;
    }
}

// Exportar instancia única
export const studentManagementService = new StudentManagementService();