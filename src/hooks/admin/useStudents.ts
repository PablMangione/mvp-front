// src/hooks/admin/useStudents.ts
import { useState, useCallback } from 'react';
import { studentManagementService } from '../../services/admin';
import type { StudentDto, CreateStudentDto } from '../../types/admin.types';

interface UseStudentsReturn {
    students: StudentDto[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    loading: boolean;
    error: string | null;

    // Acciones
    fetchStudents: (page?: number, size?: number, sort?: string) => Promise<void>;
    createStudent: (data: CreateStudentDto) => Promise<StudentDto>;
    updateStudent: (id: number, data: Partial<CreateStudentDto>) => Promise<StudentDto>;
    deleteStudent: (id: number) => Promise<void>;
    searchStudents: (query: string) => Promise<StudentDto[]>;
    getStudentById: (id: number) => Promise<StudentDto>;
}

/**
 * Hook personalizado para gestión de estudiantes desde admin.
 * Maneja estado, carga y errores de las operaciones CRUD.
 */
export const useStudents = (): UseStudentsReturn => {
    const [students, setStudents] = useState<StudentDto[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener lista paginada de estudiantes
    const fetchStudents = useCallback(async (page = 0, size = 20, sort?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await studentManagementService.getStudents(page, size, sort);

            setStudents(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar estudiantes');
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nuevo estudiante
    const createStudent = useCallback(async (data: CreateStudentDto): Promise<StudentDto> => {
        try {
            setLoading(true);
            setError(null);
            const newStudent = await studentManagementService.createStudent(data);

            // Actualizar lista local
            setStudents(prev => [newStudent, ...prev]);
            setTotalElements(prev => prev + 1);

            return newStudent;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al crear estudiante';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar estudiante
    const updateStudent = useCallback(async (id: number, data: Partial<CreateStudentDto>): Promise<StudentDto> => {
        try {
            setLoading(true);
            setError(null);
            const updatedStudent = await studentManagementService.updateStudent(id, data);

            // Actualizar en la lista local
            setStudents(prev => prev.map(student =>
                student.id === id ? updatedStudent : student
            ));

            return updatedStudent;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar estudiante';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar estudiante
    const deleteStudent = useCallback(async (id: number): Promise<void> => {
        try {
            setLoading(true);
            setError(null);
            await studentManagementService.deleteStudent(id);

            // Eliminar de la lista local
            setStudents(prev => prev.filter(student => student.id !== id));
            setTotalElements(prev => prev - 1);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al eliminar estudiante';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar estudiantes
    const searchStudents = useCallback(async (query: string): Promise<StudentDto[]> => {
        try {
            setLoading(true);
            setError(null);
            const results = await studentManagementService.searchStudents(query);
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al buscar estudiantes';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Obtener estudiante por ID
    const getStudentById = useCallback(async (id: number): Promise<StudentDto> => {
        try {
            setLoading(true);
            setError(null);
            const student = await studentManagementService.getStudentById(id);
            return student;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al obtener estudiante';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        students,
        totalPages,
        totalElements,
        currentPage,
        loading,
        error,
        fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        searchStudents,
        getStudentById
    };
};