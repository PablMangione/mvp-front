// src/services/student/subjectService.ts
import { BaseService } from '../baseService';
import type { Subject, CourseGroup } from '../../types/student.types';

/**
 * Servicio para gestión de asignaturas y grupos.
 */
class SubjectService extends BaseService {
    constructor() {
        super('/students');
    }

    /**
     * Obtiene las asignaturas de la carrera del estudiante
     */
    async getMySubjects(): Promise<Subject[]> {
        return this.get<Subject[]>('/subjects');
    }

    /**
     * Obtiene asignaturas por año
     */
    async getSubjectsByYear(year: number): Promise<Subject[]> {
        return this.get<Subject[]>(`/subjects/year/${year}`);
    }

    /**
     * Obtiene los grupos disponibles de una asignatura
     */
    async getSubjectGroups(subjectId: number): Promise<CourseGroup[]> {
        return this.get<CourseGroup[]>(`/subjects/${subjectId}/groups`);
    }

    /**
     * Obtiene el detalle de una asignatura específica
     */
    async getSubjectDetail(subjectId: number): Promise<Subject> {
        return this.get<Subject>(`/subjects/${subjectId}`);
    }

    /**
     * Busca asignaturas por nombre
     */
    async searchSubjects(query: string): Promise<Subject[]> {
        return this.get<Subject[]>(`/subjects/search?q=${encodeURIComponent(query)}`);
    }

    /**
     * Obtiene asignaturas recomendadas para el estudiante
     */
    async getRecommendedSubjects(): Promise<Subject[]> {
        return this.get<Subject[]>('/subjects/recommended');
    }
}

// Exportar instancia única
export const subjectService = new SubjectService();