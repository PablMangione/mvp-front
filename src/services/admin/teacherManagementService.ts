// src/services/admin/teacherManagementService.ts

import { BaseService } from '../baseService';
import type {
    TeacherDto,
    CreateTeacherDto,
    PageResponseDto,
    DeleteResponseDto,
    PageRequest
} from '../../types/admin.types';

/**
 * Servicio para gestión administrativa de profesores.
 *
 * Este servicio encapsula todas las operaciones que un administrador puede
 * realizar sobre los profesores del sistema. Es fundamental para mantener
 * actualizada la plantilla docente y gestionar las asignaciones de grupos.
 *
 * Consideraciones importantes:
 * - Un profesor no puede ser eliminado si tiene grupos activos asignados
 * - Los profesores pueden tener múltiples grupos en diferentes asignaturas
 * - El email del profesor es único y sirve como credencial de acceso
 *
 * Todas las operaciones requieren autenticación con rol ADMIN.
 */
class TeacherManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene la lista completa de profesores con paginación.
     *
     * Gestion de personal
     * docente. La paginación permite manejar eficientemente grandes
     * cantidades de profesores en instituciones de cualquier tamaño.
     */
    async getAllTeachers(params?: PageRequest): Promise<PageResponseDto<TeacherDto>> {
        const queryParams = new URLSearchParams();

        // Construir los parámetros de consulta de forma segura
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/teachers?${queryString}` : '/teachers';

        return this.get<PageResponseDto<TeacherDto>>(endpoint);
    }

    /**
     * Crea un nuevo profesor en el sistema (Alta).
     *
     * Registra un nuevo profesor con sus credenciales iniciales.
     * Es importante notar que:
     * - El email debe ser único
     * - La contraseña se hashea automáticamente en el backend
     * - El profesor creado podrá iniciar sesión inmediatamente
     */
    async createTeacher(data: CreateTeacherDto): Promise<TeacherDto> {
        return this.post<TeacherDto>('/teachers', data);
    }

    /**
     * Obtiene la información detallada de un profesor específico.
     *
     * Sirve para:
     * - Verificar información antes de realizar cambios
     * - Mostrar perfiles detallados en la interfaz administrativa
     * - Validar asignaciones de grupos

     */
    async getTeacherById(teacherId: number): Promise<TeacherDto> {
        return this.get<TeacherDto>(`/teachers/${teacherId}`);
    }

    /**
     * Actualiza la información de un profesor existente.
     *
     * Consideraciones importantes sobre la actualización:
     * - El email NO puede ser modificado por seguridad
     * - La contraseña debe cambiarse mediante un proceso separado
     * - Los cambios se reflejan inmediatamente en el sistema
     */
    async updateTeacher(teacherId: number, data: Partial<TeacherDto>): Promise<TeacherDto> {
        // Filtrar campos que no deben ser actualizados
        const { id, createdAt, updatedAt, email, ...updateData } = data;
        return this.put<TeacherDto>(`/teachers/${teacherId}`, updateData);
    }

    /**
     * Elimina un profesor del sistema (Baja).
     *
     * Esta es una operación crítica con las siguientes restricciones:
     * - NO se puede eliminar si el profesor tiene grupos ACTIVOS asignados
     * - Los grupos en estado PLANNED o CLOSED no bloquean la eliminación
     * - La eliminación es permanente y no se puede deshacer
     *
     * Antes de eliminar un profesor con grupos activos, se debe:
     * 1. Reasignar los grupos a otro profesor, o
     * 2. Cambiar el estado de los grupos a CLOSED
     */
    async deleteTeacher(teacherId: number): Promise<DeleteResponseDto> {
        return this.delete<DeleteResponseDto>(`/teachers/${teacherId}`);
    }

    /**
     * Busca profesores por nombre o email.
     *
     * Facilita la búsqueda rápida de profesores en interfaces administrativas.
     * La búsqueda es insensible a mayúsculas/minúsculas y busca coincidencias
     * parciales en ambos campos (nombre y email).
     */
    async searchTeachers(
        searchTerm: string,
        params?: PageRequest
    ): Promise<PageResponseDto<TeacherDto>> {
        const queryParams = new URLSearchParams();
        queryParams.append('search', searchTerm);

        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sort) queryParams.append('sort', params.sort);

        return this.get<PageResponseDto<TeacherDto>>(`/teachers?${queryParams.toString()}`);
    }

    /**
     * Verifica si un profesor puede ser eliminado.
     * Un profesor NO puede eliminarse si tiene grupos ACTIVOS.
     */
    async canDeleteTeacher(teacherId: number): Promise<boolean> {
        try {
            const response = await this.get<{ canDelete: boolean }>(
                `/teachers/${teacherId}/can-delete`
            );
            return response.canDelete;
        } catch {
            return false;
        }
    }
}

// Exportar instancia única del servicio
export const teacherManagementService = new TeacherManagementService();