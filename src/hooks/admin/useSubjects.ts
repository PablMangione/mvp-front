// src/hooks/admin/useSubjects.ts
import { useState, useCallback } from 'react';
import { subjectManagementService } from '../../services/admin';
import type { SubjectDto, CreateSubjectDto, UpdateSubjectDto } from '../../types/admin.types';

interface UseSubjectsReturn {
    subjects: SubjectDto[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    loading: boolean;
    error: string | null;

    // Acciones
    fetchSubjects: (page?: number, size?: number, sort?: string) => Promise<void>;
    createSubject: (data: CreateSubjectDto) => Promise<SubjectDto>;
    updateSubject: (id: number, data: UpdateSubjectDto) => Promise<SubjectDto>;
    deleteSubject: (id: number) => Promise<void>;
    searchSubjects: (query: string) => Promise<SubjectDto[]>;
    getSubjectById: (id: number) => Promise<SubjectDto>;
    getSubjectsByMajor: (major: string) => Promise<SubjectDto[]>;
    getSubjectsByYear: (year: number) => Promise<SubjectDto[]>;
}

/**
 * Hook personalizado para gestión de asignaturas desde admin.
 * Maneja estado, carga y errores de las operaciones CRUD.
 */
export const useSubjects = (): UseSubjectsReturn => {
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener lista paginada de asignaturas
    const fetchSubjects = useCallback(async (page = 0, size = 20, sort?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await subjectManagementService.getSubjects(page, size, sort);

            setSubjects(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar asignaturas');
            console.error('Error fetching subjects:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nueva asignatura
    const createSubject = useCallback(async (data: CreateSubjectDto): Promise<SubjectDto> => {
        try {
            setLoading(true);
            setError(null);
            const newSubject = await subjectManagementService.createSubject(data);

            // Actualizar lista local
            setSubjects(prev => [newSubject, ...prev]);
            setTotalElements(prev => prev + 1);

            return newSubject;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al crear asignatura';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar asignatura
    const updateSubject = useCallback(async (id: number, data: UpdateSubjectDto): Promise<SubjectDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedSubject = await subjectManagementService.updateSubject(id, data);

            // Actualizar en la lista local
            setSubjects(prev => prev.map(subject =>
                subject.id === id ? updatedSubject : subject
            ));

            return updatedSubject;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar asignatura';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar asignatura
    const deleteSubject = useCallback(async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await subjectManagementService.deleteSubject(id);

            // Eliminar de la lista local
            setSubjects(prev => prev.filter(subject => subject.id !== id));
            setTotalElements(prev => prev - 1);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al eliminar asignatura';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar asignaturas
    const searchSubjects = useCallback(async (query: string): Promise<SubjectDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await subjectManagementService.searchSubjects(query);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al buscar asignaturas';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener asignatura por ID
    const getSubjectById = useCallback(async (id: number): Promise<SubjectDto> => {
        try {
            setLoading(true);
            setError(null);
            const subject = await subjectManagementService.getSubjectById(id);
            return subject;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener asignatura';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener asignaturas por carrera
    const getSubjectsByMajor = useCallback(async (major: string): Promise<SubjectDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await subjectManagementService.getSubjectsByMajor(major);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener asignaturas por carrera';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener asignaturas por año
    const getSubjectsByYear = useCallback(async (year: number): Promise<SubjectDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await subjectManagementService.getSubjectsByYear(year);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener asignaturas por año';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        subjects,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchSubjects,
        createSubject,
        updateSubject,
        deleteSubject,
        searchSubjects,
        getSubjectById,
        getSubjectsByMajor,
        getSubjectsByYear
    };
};