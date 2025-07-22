// src/services/admin/studentManagementService.ts

import { BaseService } from '../baseService';
import type {
    StudentDto,
    CreateStudentDto,
    PageResponseDto,
    DeleteResponseDto,
    PageRequest
} from '../../types/admin.types';

/**
 * Servicio para gestión administrativa de estudiantes.
 *
 * Proporciona funcionalidades CRUD completas para que los administradores
 * puedan gestionar los estudiantes del sistema. Todas las operaciones
 * requieren autenticación con rol ADMIN.
 *
 * Funcionalidades principales:
 * - Listar estudiantes con paginación y ordenamiento
 * - Crear nuevos estudiantes (alta)
 * - Obtener información detallada de un estudiante
 * - Actualizar datos de estudiantes existentes
 * - Eliminar estudiantes (baja) - solo si no tienen inscripciones activas
 */
class StudentManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene la lista de estudiantes con paginación.
     *
     * Permite al administrador ver todos los estudiantes
     * del sistema de forma paginada. Es útil para gestión masiva
     * y búsqueda de estudiantes específicos.
     * });
     */
    async getAllStudents(params?: PageRequest): Promise<PageResponseDto<StudentDto>> {
        // Construir query string con los parámetros de paginación
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/students?${queryString}` : '/students';

        return this.get<PageResponseDto<StudentDto>>(endpoint);
    }

    /**
     * Crea un nuevo estudiante en el sistema (Alta).
     *
     * Permite dar de alta a un nuevo estudiante con todos
     * sus datos iniciales. El email debe ser único en el sistema.
     * La contraseña se hashea automáticamente en el backend.
     */
    async createStudent(data: CreateStudentDto): Promise<StudentDto> {
        return this.post<StudentDto>('/students', data);
    }

    /**
     * Obtiene la información detallada de un estudiante específico.
     *
     * Útil para ver todos los datos de un estudiante antes de
     * realizar modificaciones o para consultas específicas.
     */
    async getStudentById(studentId: number): Promise<StudentDto> {
        return this.get<StudentDto>(`/students/${studentId}`);
    }

    /**
     * Actualiza los datos de un estudiante existente.
     *
     * Permite modificar la información básica del estudiante.
     * No se puede cambiar el email por razones de seguridad.
     * Para cambiar la contraseña se debe usar un endpoint específico.
     * });
     */
    async updateStudent(studentId: number, data: Partial<StudentDto>): Promise<StudentDto> {
        // Excluir campos que no deben actualizarse
        const { id, createdAt, updatedAt, email, ...updateData } = data;
        return this.put<StudentDto>(`/students/${studentId}`, updateData);
    }

    /**
     * Elimina un estudiante del sistema (Baja).
     *
     * Esta operación es permanente y solo se permite si el estudiante
     * no tiene inscripciones activas en ningún curso. Si tiene inscripciones,
     * primero deben ser canceladas o el grupo debe estar cerrado.
     */
    async deleteStudent(studentId: number): Promise<DeleteResponseDto> {
        return this.delete<DeleteResponseDto>(`/students/${studentId}`);
    }

    /**
     * Busca estudiantes por criterios específicos.
     *
     * Helper que facilita la búsqueda de estudiantes
     * por nombre o email usando los parámetros de paginación.
     *
     * @param searchTerm - Término de búsqueda
     * @param params - Parámetros de paginación
     * @returns Página de resultados filtrados
     */
    async searchStudents(
        searchTerm: string,
        params?: PageRequest
    ): Promise<PageResponseDto<StudentDto>> {
        const queryParams = new URLSearchParams();
        queryParams.append('search', searchTerm);
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        return this.get<PageResponseDto<StudentDto>>(`/students?${queryParams.toString()}`);
    }

    /**
     * Verifica si un email ya está registrado en el sistema.
     */
    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const response = await this.get<{ exists: boolean }>(
                `/students/check-email?email=${encodeURIComponent(email)}`
            );
            return response.exists;
        } catch {
            return false;
        }
    }
}

// Exportar instancia única del servicio
export const studentManagementService = new StudentManagementService();