// src/hooks/admin/useTeachers.ts
import { useState, useCallback } from 'react';
import { teacherManagementService } from '../../services/admin';
import type { TeacherDto, CreateTeacherDto } from '../../types/admin.types';

interface UseTeachersReturn {
    teachers: TeacherDto[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    loading: boolean;
    error: string | null;

    // Acciones
    fetchTeachers: (page?: number, size?: number, sort?: string) => Promise<void>;
    createTeacher: (data: CreateTeacherDto) => Promise<TeacherDto>;
    updateTeacher: (id: number, data: Partial<CreateTeacherDto>) => Promise<TeacherDto>;
    deleteTeacher: (id: number) => Promise<void>;
    searchTeachers: (query: string) => Promise<TeacherDto[]>;
    getTeacherById: (id: number) => Promise<TeacherDto>;
    getAvailableTeachers: () => Promise<TeacherDto[]>;
}

/**
 * Hook personalizado para gestión de profesores desde admin.
 * Maneja estado, carga y errores de las operaciones CRUD.
 */
export const useTeachers = (): UseTeachersReturn => {
    const [teachers, setTeachers] = useState<TeacherDto[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener lista paginada de profesores
    const fetchTeachers = useCallback(async (page = 0, size = 20, sort?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await teacherManagementService.getTeachers(page, size, sort);

            setTeachers(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar profesores');
            console.error('Error fetching teachers:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nuevo profesor
    const createTeacher = useCallback(async (data: CreateTeacherDto): Promise<TeacherDto> => {
        try {
            setLoading(true);
            setError(null);
            const newTeacher = await teacherManagementService.createTeacher(data);

            // Actualizar lista local
            setTeachers(prev => [newTeacher, ...prev]);
            setTotalElements(prev => prev + 1);

            return newTeacher;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al crear profesor';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar profesor
    const updateTeacher = useCallback(async (id: number, data: Partial<CreateTeacherDto>): Promise<TeacherDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedTeacher = await teacherManagementService.updateTeacher(id, data);

            // Actualizar en la lista local
            setTeachers(prev => prev.map(teacher =>
                teacher.id === id ? updatedTeacher : teacher
            ));

            return updatedTeacher;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar profesor';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar profesor
    const deleteTeacher = useCallback(async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await teacherManagementService.deleteTeacher(id);

            // Eliminar de la lista local
            setTeachers(prev => prev.filter(teacher => teacher.id !== id));
            setTotalElements(prev => prev - 1);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al eliminar profesor';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar profesores
    const searchTeachers = useCallback(async (query: string): Promise<TeacherDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await teacherManagementService.searchTeachers(query);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al buscar profesores';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener profesor por ID
    const getTeacherById = useCallback(async (id: number): Promise<TeacherDto> => {
        try {
            setLoading(true);
            setError(null);
            const teacher = await teacherManagementService.getTeacherById(id);
            return teacher;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener profesor';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener profesores disponibles
    const getAvailableTeachers = useCallback(async (): Promise<TeacherDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const available = await teacherManagementService.getAvailableTeachers();
            return available;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener profesores disponibles';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        teachers,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchTeachers,
        createTeacher,
        updateTeacher,
        deleteTeacher,
        searchTeachers,
        getTeacherById,
        getAvailableTeachers
    };
};