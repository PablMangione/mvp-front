// src/hooks/admin/useGroups.ts
import { useState, useCallback } from 'react';
import { groupManagementService } from '../../services/admin';
import type {
    CourseGroupDto,
    CreateGroupDto,
    UpdateGroupDto,
    UpdateGroupStatusDto,
    AssignTeacherDto,
} from '../../types/admin.types';

interface UseGroupsReturn {
    groups: CourseGroupDto[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    loading: boolean;
    error: string | null;

    // Acciones
    fetchGroups: (page?: number, size?: number, sort?: string) => Promise<void>;
    createGroup: (data: CreateGroupDto) => Promise<CourseGroupDto>;
    updateGroup: (id: number, data: UpdateGroupDto) => Promise<CourseGroupDto>;
    updateGroupStatus: (id: number, data: UpdateGroupStatusDto) => Promise<CourseGroupDto>;
    assignTeacher: (groupId: number, data: AssignTeacherDto) => Promise<CourseGroupDto>;
    deleteGroup: (id: number) => Promise<void>;
    searchGroups: (query: string) => Promise<CourseGroupDto[]>;
    getGroupById: (id: number) => Promise<CourseGroupDto>;
    getGroupsBySubject: (subjectId: number) => Promise<CourseGroupDto[]>;
    getGroupsByTeacher: (teacherId: number) => Promise<CourseGroupDto[]>;
    getGroupsByStatus: (status: 'PLANIFICADO' | 'ACTIVO' | 'CERRADO') => Promise<CourseGroupDto[]>;
}

/**
 * Hook personalizado para gestión de grupos desde admin.
 * Maneja estado, carga y errores de las operaciones CRUD y cambios de estado.
 */
export const useGroups = (): UseGroupsReturn => {
    const [groups, setGroups] = useState<CourseGroupDto[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener lista paginada de grupos
    const fetchGroups = useCallback(async (page = 0, size = 20, sort?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await groupManagementService.getGroups(page, size, sort);

            setGroups(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar grupos');
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nuevo grupo
    const createGroup = useCallback(async (data: CreateGroupDto): Promise<CourseGroupDto> => {
        try {
            setLoading(true);
            setError(null);
            const newGroup = await groupManagementService.createGroup(data);

            // Actualizar lista local
            setGroups(prev => [newGroup, ...prev]);
            setTotalElements(prev => prev + 1);

            return newGroup;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al crear grupo';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar grupo
    const updateGroup = useCallback(async (id: number, data: UpdateGroupDto): Promise<CourseGroupDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedGroup = await groupManagementService.updateGroup(id, data);

            // Actualizar en la lista local
            setGroups(prev => prev.map(group =>
                group.id === id ? updatedGroup : group
            ));

            return updatedGroup;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar grupo';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar estado del grupo
    const updateGroupStatus = useCallback(async (id: number, data: UpdateGroupStatusDto): Promise<CourseGroupDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedGroup = await groupManagementService.updateGroupStatus(id, data);

            // Actualizar en la lista local
            setGroups(prev => prev.map(group =>
                group.id === id ? updatedGroup : group
            ));

            return updatedGroup;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al cambiar estado del grupo';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Asignar profesor a grupo
    const assignTeacher = useCallback(async (groupId: number, data: AssignTeacherDto): Promise<CourseGroupDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedGroup = await groupManagementService.assignTeacher(groupId, data);

            // Actualizar en la lista local
            setGroups(prev => prev.map(group =>
                group.id === groupId ? updatedGroup : group
            ));

            return updatedGroup;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al asignar profesor';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar grupo
    const deleteGroup = useCallback(async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await groupManagementService.deleteGroup(id);

            // Eliminar de la lista local
            setGroups(prev => prev.filter(group => group.id !== id));
            setTotalElements(prev => prev - 1);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al eliminar grupo';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar grupos
    const searchGroups = useCallback(async (query: string): Promise<CourseGroupDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await groupManagementService.searchGroups(query);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al buscar grupos';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener grupo por ID
    const getGroupById = useCallback(async (id: number): Promise<CourseGroupDto> => {
        try {
            setLoading(true);
            setError(null);
            const group = await groupManagementService.getGroupById(id);
            return group;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener grupo';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener grupos por asignatura
    const getGroupsBySubject = useCallback(async (subjectId: number): Promise<CourseGroupDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await groupManagementService.getGroupsBySubject(subjectId);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener grupos por asignatura';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener grupos por profesor
    const getGroupsByTeacher = useCallback(async (teacherId: number): Promise<CourseGroupDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await groupManagementService.getGroupsByTeacher(teacherId);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener grupos por profesor';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener grupos por estado
    const getGroupsByStatus = useCallback(async (status: 'PLANIFICADO' | 'ACTIVO' | 'CERRADO'): Promise<CourseGroupDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await groupManagementService.getGroupsByStatus(status);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener grupos por estado';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        groups,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchGroups,
        createGroup,
        updateGroup,
        updateGroupStatus,
        assignTeacher,
        deleteGroup,
        searchGroups,
        getGroupById,
        getGroupsBySubject,
        getGroupsByTeacher,
        getGroupsByStatus
    };
};