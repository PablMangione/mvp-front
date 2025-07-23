// src/services/admin/groupManagementService.ts

import { BaseService } from '../baseService';
import type {
    CourseGroupDto,
    CreateCourseGroupDto,
    UpdateGroupStatusDto,
    AssignTeacherDto,
    DeleteResponseDto,
    CreateGroupSessionDto, GroupSessionDto
} from '../../types/admin.types';

/**
 * Servicio para gestión administrativa de grupos de curso.
 *
 * Los grupos son la unidad fundamental donde ocurre la enseñanza. Un grupo
 * representa una instancia específica de una asignatura con:
 * - Un profesor asignado (opcional inicialmente)
 * - Un horario definido (sesiones semanales)
 * - Una capacidad máxima de estudiantes
 * - Un estado que controla su ciclo de vida
 *
 * El flujo típico de un grupo es:
 * 1. PLANNED: Grupo creado pero no disponible para inscripciones
 * 2. ACTIVE: Acepta inscripciones de estudiantes
 * 3. CLOSED: No acepta más inscripciones, período académico finalizado
 *
 * Este servicio gestiona el ciclo de vida del grupo, desde su creación
 * hasta su eventual eliminación o archivo.
 */
class GroupManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Crea un nuevo grupo de curso.
     *
     * La creación de un grupo es un proceso fundamental que establece:
     * - La asignatura que se impartirá
     * - El tipo de grupo (regular, intensivo, remedial)
     * - El precio del curso
     * - Opcionalmente, el profesor asignado
     * - Opcionalmente, las sesiones/horarios
     *
     * Un grupo se crea siempre en estado PLANNED, lo que permite prepararlo
     * completamente antes de abrirlo a inscripciones. Esto incluye asignar
     * profesor, definir horarios y preparar materiales.
     */
    async createGroup(data: CreateCourseGroupDto): Promise<CourseGroupDto> {
        return this.post<CourseGroupDto>('/groups', data);
    }

    /**
     * Cambia el estado de un grupo existente.
     *
     * El cambio de estado es una operación crítica que afecta directamente
     * la disponibilidad del grupo para inscripciones. Las transiciones
     * permitidas son:
     *
     * - PLANNED → ACTIVE: Abre el grupo para inscripciones
     * - PLANNED → CLOSED: Cancela un grupo antes de activarlo
     * - ACTIVE → CLOSED: Finaliza el período de inscripciones
     *
     * Una vez que un grupo está CLOSED, no puede volver a cambiar de estado.
     * Esto garantiza la integridad histórica del sistema.
     *
     * Consideraciones por estado:
     * - PLANNED: Sin estudiantes, se puede modificar libremente
     * - ACTIVE: Con estudiantes inscritos, cambios limitados
     * - CLOSED: Estado final, solo lectura
     */
    async updateGroupStatus(
        groupId: number,
        data: UpdateGroupStatusDto
    ): Promise<CourseGroupDto> {
        return this.put<CourseGroupDto>(`/groups/${groupId}/status`, data);
    }

    /**
     * Asigna un profesor a un grupo que no tiene profesor.
     *
     * Esta operación es común cuando se crean grupos sin profesor asignado
     * inicialmente, permitiendo flexibilidad en la planificación.
     *
     * Consideraciones importantes:
     * - Solo se puede asignar si el grupo NO tiene profesor
     * - El profesor debe estar disponible (sin conflictos de horario)
     * - La asignación es permanente (no hay endpoint para desasignar)
     *
     * Si se necesita cambiar el profesor, la práctica recomendada es:
     * 1. Cerrar el grupo actual
     * 2. Crear un nuevo grupo con el nuevo profesor
     * 3. Migrar los estudiantes si es necesario
     */
    async assignTeacher(
        groupId: number,
        data: AssignTeacherDto
    ): Promise<CourseGroupDto> {
        return this.put<CourseGroupDto>(`/groups/${groupId}/assign-teacher`, data);
    }

    /**
     * Elimina un grupo del sistema.
     *
     * La eliminación de grupos tiene restricciones estrictas para proteger
     * la integridad del sistema y el historial académico:
     *
     * Solo se pueden eliminar grupos que:
     * 1. Estén en estado PLANNED (nunca se activaron)
     * 2. NO tengan estudiantes inscritos
     *
     * Los grupos ACTIVE o CLOSED forman parte del historial académico y no
     * deben eliminarse. En su lugar, se mantienen en estado CLOSED para
     * referencia futura, reportes y auditorías.
     *
     * Si necesita "cancelar" un grupo ACTIVE, debe:
     * 1. Cambiar su estado a CLOSED
     * 2. Gestionar las devoluciones/reubicaciones de estudiantes
     * 3. El grupo permanecerá en el sistema como registro histórico
     */
    async deleteGroup(groupId: number): Promise<DeleteResponseDto> {
        return this.delete<DeleteResponseDto>(`/groups/${groupId}`);
    }

    /**
     * Obtiene la información detallada de un grupo específico.
     */
    async getGroupById(groupId: number): Promise<CourseGroupDto> {
        return this.get<CourseGroupDto>(`/groups/${groupId}`);
    }

    /**
     * Obtiene todos los grupos de una asignatura específica.
     * Útil para analizar la oferta disponible de una asignatura.
     */
    async getGroupsBySubject(subjectId: number | undefined): Promise<CourseGroupDto[]> {
        return this.get<CourseGroupDto[]>(`/subjects/${subjectId}/groups`);
    }

    /**
     * Verifica si un grupo puede ser eliminado.
     * Solo grupos en estado PLANNED sin estudiantes pueden eliminarse.
     */
    async canDeleteGroup(groupId: number): Promise<boolean> {
        try {
            const group = await this.getGroupById(groupId);
            return group.status === 'PLANNED' && group.enrolledStudents === 0;
        } catch {
            return false;
        }
    }

    /**
     * Añade una nueva sesión (horario) a un grupo existente.
     */
    async addGroupSession(
        groupId: number,
        sessionData: CreateGroupSessionDto
    ): Promise<CourseGroupDto> {
        return this.post<CourseGroupDto>(`/groups/${groupId}/sessions`, sessionData);
    }

    /**
     * Obtiene todos los grupos asignados a un profesor específico.
     */
    async getGroupsByTeacher(teacherId: number): Promise<CourseGroupDto[]> {
        return this.get<CourseGroupDto[]>(`/teachers/${teacherId}/groups`);
    }

    async getAllGroups(): Promise<CourseGroupDto[]> {
        return this.get<CourseGroupDto[]>(`/groups/all`);
    }

    async getGroupSessions(groupId: number): Promise<GroupSessionDto[]> {
        return this.get<GroupSessionDto[]>(`/groups/${groupId}/sessions/`);
    }


}

// Exportar instancia única del servicio
export const groupManagementService = new GroupManagementService();