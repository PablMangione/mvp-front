// src/services/student/enrollmentService.ts
import { BaseService } from '../baseService';
import type { EnrollmentSummary } from '../../types/student.types';

/**
 * Servicio para gestión de inscripciones del estudiante.
 */
class EnrollmentService extends BaseService {
    constructor() {
        super('/students');
    }

    /**
     * Obtiene todas las inscripciones del estudiante
     */
    async getMyEnrollments(): Promise<EnrollmentSummary[]> {
        return this.get<EnrollmentSummary[]>('/enrollments');
    }

    /**
     * Inscribe al estudiante en un grupo
     */
    async enrollInGroup(subjectId: number, groupId: number): Promise<any> {
        return this.post(`/subjects/${subjectId}/groups/${groupId}/enroll`);
    }

    /**
     * Cancela una inscripción
     */
    async cancelEnrollment(enrollmentId: number): Promise<any> {
        return this.delete(`/enrollments/${enrollmentId}`);
    }

    /**
     * Obtiene el detalle de una inscripción específica
     */
    async getEnrollmentDetail(enrollmentId: number): Promise<EnrollmentSummary> {
        return this.get<EnrollmentSummary>(`/enrollments/${enrollmentId}`);
    }

    /**
     * Verifica si el estudiante puede inscribirse en un grupo
     */
    async canEnrollInGroup(groupId: number): Promise<boolean> {
        try {
            const response = await this.get<{ canEnroll: boolean }>(`/groups/${groupId}/can-enroll`);
            return response.canEnroll;
        } catch {
            return false;
        }
    }
}

// Exportar instancia única
export const enrollmentService = new EnrollmentService();