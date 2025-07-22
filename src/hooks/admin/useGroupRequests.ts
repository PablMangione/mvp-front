// src/hooks/admin/useGroupRequests.ts
import { useState, useCallback } from 'react';
import { groupRequestManagementService } from '../../services/admin';
import type { GroupRequestDto, UpdateRequestStatusDto } from '../../types/admin.types';

interface UseGroupRequestsReturn {
    requests: GroupRequestDto[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    loading: boolean;
    error: string | null;

    // Acciones
    fetchRequests: (page?: number, size?: number, sort?: string, status?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA') => Promise<void>;
    approveRequest: (id: number, comment?: string) => Promise<GroupRequestDto>;
    rejectRequest: (id: number, reason: string) => Promise<GroupRequestDto>;
    updateRequestStatus: (id: number, data: UpdateRequestStatusDto) => Promise<GroupRequestDto>;
    getRequestById: (id: number) => Promise<GroupRequestDto>;
    getRequestsByStudent: (studentId: number) => Promise<GroupRequestDto[]>;
    getRequestsBySubject: (subjectId: number) => Promise<GroupRequestDto[]>;
    getPendingRequests: () => Promise<GroupRequestDto[]>;
}

/**
 * Hook personalizado para gestión de solicitudes de grupo desde admin.
 * Maneja aprobación, rechazo y consulta de solicitudes.
 */
export const useGroupRequests = (): UseGroupRequestsReturn => {
    const [requests, setRequests] = useState<GroupRequestDto[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener lista paginada de solicitudes
    const fetchRequests = useCallback(async (
        page = 0,
        size = 20,
        sort?: string,
        status?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
    ) => {
        try {
            setLoading(true);
            setError(null);
            const response = await groupRequestManagementService.getGroupRequests(page, size, sort, status);

            setRequests(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
            console.error('Error fetching group requests:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Aprobar solicitud
    const approveRequest = useCallback(async (id: number, comment?: string): Promise<GroupRequestDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedRequest = await groupRequestManagementService.approveRequest(id, comment);

            // Actualizar en la lista local
            setRequests(prev => prev.map(request =>
                request.id === id ? updatedRequest : request
            ));

            return updatedRequest;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al aprobar solicitud';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Rechazar solicitud
    const rejectRequest = useCallback(async (id: number, reason: string): Promise<GroupRequestDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedRequest = await groupRequestManagementService.rejectRequest(id, reason);

            // Actualizar en la lista local
            setRequests(prev => prev.map(request =>
                request.id === id ? updatedRequest : request
            ));

            return updatedRequest;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al rechazar solicitud';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar estado de solicitud
    const updateRequestStatus = useCallback(async (id: number, data: UpdateRequestStatusDto): Promise<GroupRequestDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedRequest = await groupRequestManagementService.updateRequestStatus(id, data);

            // Actualizar en la lista local
            setRequests(prev => prev.map(request =>
                request.id === id ? updatedRequest : request
            ));

            return updatedRequest;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar solicitud';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener solicitud por ID
    const getRequestById = useCallback(async (id: number): Promise<GroupRequestDto> => {
        try {
            setLoading(true);
            setError(null);
            const request = await groupRequestManagementService.getRequestById(id);
            return request;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener solicitud';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener solicitudes por estudiante
    const getRequestsByStudent = useCallback(async (studentId: number): Promise<GroupRequestDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await groupRequestManagementService.getRequestsByStudent(studentId);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener solicitudes del estudiante';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener solicitudes por asignatura
    const getRequestsBySubject = useCallback(async (subjectId: number): Promise<GroupRequestDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await groupRequestManagementService.getRequestsBySubject(subjectId);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener solicitudes por asignatura';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener solicitudes pendientes
    const getPendingRequests = useCallback(async (): Promise<GroupRequestDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await groupRequestManagementService.getPendingRequests();
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener solicitudes pendientes';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        requests,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchRequests,
        approveRequest,
        rejectRequest,
        updateRequestStatus,
        getRequestById,
        getRequestsByStudent,
        getRequestsBySubject,
        getPendingRequests
    };
};