// src/services/admin/subjectManagementService.ts

import { BaseService } from '../baseService';
import type {
    SubjectDto,
    CreateSubjectDto,
    UpdateSubjectDto,
    DeleteResponseDto
} from '../../types/admin.types';

/**
 * Servicio para gestión administrativa de asignaturas.
 *
 * Las asignaturas son entidades fundamentales en el sistema académico, ya que:
 * - Definen el plan de estudios de cada carrera
 * - Son la base para crear grupos de curso
 * - Determinan qué pueden inscribir los estudiantes según su carrera y año
 *
 * Este servicio permite a los administradores mantener actualizado el catálogo
 * de asignaturas, adaptándose a cambios curriculares y nuevas necesidades
 * académicas.
 *
 * Restricciones importantes:
 * - Una asignatura no puede eliminarse si tiene grupos asociados
 * - Una asignatura no puede eliminarse si tiene solicitudes de grupo pendientes
 * - El nombre de asignatura debe ser único dentro de cada carrera
 */
class SubjectManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene todas las asignaturas del sistema.
     *
     * A diferencia de estudiantes y profesores, las asignaturas generalmente
     * son un conjunto más manejable, por lo que se devuelve una
     * lista completa sin paginación. Esto facilita:
     * - La visualización del plan de estudios completo
     * - La selección de asignaturas en formularios
     * - La generación de reportes académicos
     *
     * Las asignaturas se devuelven ordenadas por carrera y año de curso
     * para facilitar su navegación.
     */
    async getAllSubjects(): Promise<SubjectDto[]> {
        return this.get<SubjectDto[]>('/subjects');
    }

    /**
     * Crea una nueva asignatura en el sistema.
     *
     * Fundamental para mantener actualizado el catálogo académico.
     * Al crear una asignatura, se debe considerar:
     * - La carrera a la que pertenece (debe existir en el sistema)
     * - El año de curso (típicamente entre 1 y 6)
     * - El nombre debe ser descriptivo y único dentro de la carrera
     *
     * Una vez creada la asignatura, los administradores pueden:
     * 1. Crear grupos para esa asignatura
     * 2. Los estudiantes pueden solicitar grupos si no existen
     */
    async createSubject(data: CreateSubjectDto): Promise<SubjectDto> {
        return this.post<SubjectDto>('/subjects', data);
    }

    /**
     * Obtiene la información detallada de una asignatura específica.
     *
     * Útil antes de realizar modificaciones o para mostrar
     * información completa en interfaces administrativas. La información
     * incluye metadatos como fechas de creación y actualización que pueden
     * ser relevantes para auditoría.
     */
    async getSubjectById(subjectId: number): Promise<SubjectDto> {
        return this.get<SubjectDto>(`/subjects/${subjectId}`);
    }

    /**
     * Actualiza la información de una asignatura existente.
     *
     * Los cambios en asignaturas deben realizarse con cuidado, ya que pueden
     * afectar a grupos existentes y estudiantes inscritos. Consideraciones:
     *
     * - Cambiar el nombre: Afecta cómo los estudiantes identifican la asignatura
     * - Cambiar la carrera: Puede hacer que estudiantes pierdan acceso
     * - Cambiar el año: Afecta el orden en el plan de estudios
     */
    async updateSubject(
        subjectId: number,
        data: UpdateSubjectDto
    ): Promise<SubjectDto> {
        return this.put<SubjectDto>(`/subjects/${subjectId}`, data);
    }

    /**
     * Elimina una asignatura del sistema.
     *
     * Esta es una operación crítica con restricciones estrictas para mantener
     * la integridad del sistema:
     *
     * NO se puede eliminar una asignatura si:
     * 1. Tiene grupos asociados (en cualquier estado)
     * 2. Tiene solicitudes de grupo pendientes
     *
     * Antes de eliminar una asignatura, asegúrese de:
     * - Eliminar todos los grupos asociados
     * - Resolver todas las solicitudes de grupo pendientes
     * - Verificar que no sea parte activa del plan de estudios
     */
    async deleteSubject(subjectId: number): Promise<DeleteResponseDto> {
        return this.delete<DeleteResponseDto>(`/subjects/${subjectId}`);
    }

    /**
     * Obtiene asignaturas filtradas por carrera.
     *
     * Facilita la visualización del plan de estudios de una carrera específica.
     * Útil para interfaces donde se necesita mostrar solo las asignaturas
     * relevantes para un grupo de estudiantes.
     */
    async getSubjectsByMajor(major: string): Promise<SubjectDto[]> {
        const allSubjects = await this.getAllSubjects();
        return allSubjects
            .filter(subject => subject.major === major)
            .sort((a, b) => a.courseYear - b.courseYear);
    }

    /**
     * Obtiene asignaturas filtradas por año de curso.
     *
     * Útil para mostrar todas las asignaturas que un estudiante de cierto
     * año podría cursar, independientemente de la carrera. Esto es especialmente
     * útil en sistemas con materias compartidas entre carreras.
     */
    async getSubjectsByCourseYear(courseYear: number): Promise<SubjectDto[]> {
        const allSubjects = await this.getAllSubjects();
        return allSubjects.filter(subject => subject.courseYear === courseYear);
    }

    /**
     * Verifica si una asignatura puede ser eliminada.
     * No puede eliminarse si tiene grupos o solicitudes pendientes.
     */
    async canDeleteSubject(subjectId: number): Promise<boolean> {
        try {
            const response = await this.get<{ canDelete: boolean }>(
                `/subjects/${subjectId}/can-delete`
            );
            return response.canDelete;
        } catch {
            return false;
        }
    }

    /**
     * Busca asignaturas por nombre.
     *
     * Implementa una búsqueda flexible que encuentra coincidencias parciales
     * en el nombre de la asignatura. Es insensible a mayúsculas/minúsculas.
     */
    async searchSubjects(searchTerm: string): Promise<SubjectDto[]> {
        const allSubjects = await this.getAllSubjects();
        const searchLower = searchTerm.toLowerCase();

        return allSubjects.filter(subject =>
            subject.name.toLowerCase().includes(searchLower)
        );
    }
}

// Exportar instancia única del servicio
export const subjectManagementService = new SubjectManagementService();