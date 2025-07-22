// src/services/admin/groupRequestManagementService.ts

import { BaseService } from '../baseService';
import type {
    GroupRequestDto,
    UpdateRequestStatusDto
} from '../../types/admin.types';

/**
 * Servicio para gestión administrativa de solicitudes de grupo.
 *
 * Las solicitudes de grupo son un mecanismo fundamental para que el sistema
 * educativo responda a las necesidades de los estudiantes. Cuando un estudiante
 * no encuentra un grupo disponible para una asignatura que necesita cursar,
 * puede generar una solicitud que llegará a los administradores.
 *
 * Este servicio permite a los administradores:
 * - Visualizar todas las solicitudes pendientes de revisión
 * - Aprobar solicitudes, lo que típicamente lleva a crear un nuevo grupo
 * - Rechazar solicitudes con justificación
 * - Analizar patrones de demanda para planificación futura
 *
 * El flujo típico es:
 * 1. Estudiante crea solicitud (desde su portal)
 * 2. Administrador revisa solicitudes pendientes
 * 3. Administrador aprueba o rechaza
 * 4. Si se aprueba, se crea un grupo nuevo
 * 5. El estudiante es notificado del resultado
 *
 * Las solicitudes son una herramienta valiosa para entender la demanda real
 * de cursos y optimizar la oferta académica.
 */
class GroupRequestManagementService extends BaseService {
    constructor() {
        super('/admin');
    }

    /**
     * Obtiene todas las solicitudes de grupo pendientes de revisión.
     *
     * Punto de entrada principal para los administradores
     * que necesitan revisar y procesar solicitudes de estudiantes. Las
     * solicitudes se muestran solo si están en estado PENDING, ya que las
     * aprobadas o rechazadas ya han sido procesadas.
     *
     * La información incluida permite al administrador tomar decisiones
     * informadas:
     * - Quién solicita (estudiante)
     * - Qué solicita (asignatura)
     * - Cuándo lo solicitó (para priorizar por antigüedad)
     *
     * Es recomendable revisar estas solicitudes regularmente, especialmente
     * antes del inicio de períodos académicos, para poder crear grupos con
     * tiempo suficiente.
     */
    async getPendingRequests(): Promise<GroupRequestDto[]> {
        return this.get<GroupRequestDto[]>('/group-requests/pending');
    }

    /**
     * Actualiza el estado de una solicitud de grupo (aprobar o rechazar).
     *
     * Esta es la acción principal que realiza un administrador sobre las
     * solicitudes. La decisión de aprobar o rechazar debe considerar:
     *
     * Para APROBAR:
     * - ¿Hay suficientes solicitudes para justificar un nuevo grupo?
     * - ¿Hay profesores disponibles para la asignatura?
     * - ¿Hay aulas y horarios disponibles?
     * - ¿Es viable económicamente abrir el grupo?
     *
     * Para RECHAZAR:
     * - ¿Ya existen grupos con cupos disponibles?
     * - ¿La demanda es insuficiente?
     * - ¿No hay recursos disponibles?
     * - ¿El estudiante puede cursarla en otro período?
     *
     * Es importante proporcionar comentarios claros, especialmente al rechazar,
     * para que el estudiante entienda la decisión y pueda planificar
     * alternativas.
     */
    async updateRequestStatus(
        requestId: number,
        data: UpdateRequestStatusDto
    ): Promise<GroupRequestDto> {
        return this.put<GroupRequestDto>(`/group-requests/${requestId}/status`, data);
    }

    /**
     * Obtiene todas las solicitudes para una asignatura específica.
     * Permite analizar la demanda real de cada asignatura.
     */
    async getRequestsBySubject(subjectId: number): Promise<GroupRequestDto[]> {
        return this.get<GroupRequestDto[]>(`/subjects/${subjectId}/group-requests`);
    }

    /**
     * Helper para procesar múltiples solicitudes.
     * Como NO existe un endpoint batch en el backend, procesa una por una.
     */
    async approveBatchRequests(
        requestIds: number[],
        comments: string,
        createdGroupId?: number
    ): Promise<GroupRequestDto[]> {
        const results: GroupRequestDto[] = [];
        const errors: Array<{ id: number; error: string }> = [];

        for (const requestId of requestIds) {
            try {
                const updated = await this.updateRequestStatus(requestId, {
                    status: 'APPROVED',
                    adminComments: comments,
                    createdGroupId
                });
                results.push(updated);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                errors.push({ id: requestId, error: errorMessage });
            }
        }

        if (errors.length > 0) {
            console.warn(`Procesadas: ${results.length} exitosas, ${errors.length} con errores`);
        }

        return results;
    }

    /**
     * Obtiene todas las solicitudes de un estudiante específico.
     */
    async getRequestsByStudent(studentId: number): Promise<GroupRequestDto[]> {
        return this.get<GroupRequestDto[]>(`/students/${studentId}/group-requests`);
    }

    /**
     * Busca solicitudes por múltiples criterios.
     */
    async searchRequests(criteria: {
        status?: string;
        studentId?: number;
        subjectId?: number;
        fromDate?: string;
        toDate?: string;
    }): Promise<GroupRequestDto[]> {
        const params = new URLSearchParams();

        if (criteria.status) params.append('status', criteria.status);
        if (criteria.studentId) params.append('studentId', criteria.studentId.toString());
        if (criteria.subjectId) params.append('subjectId', criteria.subjectId.toString());
        if (criteria.fromDate) params.append('fromDate', criteria.fromDate);
        if (criteria.toDate) params.append('toDate', criteria.toDate);

        const queryString = params.toString();
        return this.get<GroupRequestDto[]>(
            queryString ? `/group-requests/search?${queryString}` : '/group-requests/search'
        );
    }
}

// Exportar instancia única del servicio
export const groupRequestManagementService = new GroupRequestManagementService();