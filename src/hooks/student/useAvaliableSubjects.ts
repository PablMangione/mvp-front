// src/hooks/student/useAvailableSubjects.ts
import { useState, useEffect, useMemo } from 'react';
import { subjectService, enrollmentService } from '../../services/student';
import type { Subject, CourseGroup } from '../../types/student.types';

/**
 * Hook personalizado para gestionar las asignaturas disponibles.
 *
 * Características:
 * - Carga asignaturas y grupos
 * - Filtrado por año
 * - Manejo de inscripciones
 * - Estados de carga separados para optimización
 */
export const useAvailableSubjects = () => {
    // Estado principal
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [subjectGroups, setSubjectGroups] = useState<CourseGroup[]>([]);

    // Estados de carga
    const [loading, setLoading] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    // Estados de error y feedback
    const [error, setError] = useState<string | null>(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

    // Cargar asignaturas al montar
    useEffect(() => {
        fetchSubjects();
    }, []);

    // Fetch asignaturas
    const fetchSubjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await subjectService.getMySubjects();
            setSubjects(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setError('Error al cargar las asignaturas');
        } finally {
            setLoading(false);
        }
    };

    // Fetch grupos de una asignatura
    const fetchSubjectGroups = async (subject: Subject) => {
        try {
            setLoadingGroups(true);
            setSelectedSubject(subject);
            const groups = await subjectService.getSubjectGroups(subject.id);
            setSubjectGroups(groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setSubjectGroups([]);
            setError('Error al cargar los grupos');
        } finally {
            setLoadingGroups(false);
        }
    };

    // Inscribirse en un grupo
    const enrollInGroup = async (groupId: number) => {
        if (!selectedSubject) {
            setEnrollmentStatus('Error: No hay asignatura seleccionada');
            return false;
        }

        try {
            setEnrolling(true);
            setEnrollmentStatus('Procesando inscripción...');

            await enrollmentService.enrollInGroup(selectedSubject.id, groupId);

            setEnrollmentStatus('¡Inscripción exitosa!');

            // Recargar grupos para actualizar contador
            await fetchSubjectGroups(selectedSubject);

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => setEnrollmentStatus(null), 3000);
            return true;

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al inscribirse';
            setEnrollmentStatus(errorMessage);
            setTimeout(() => setEnrollmentStatus(null), 5000);
            return false;
        } finally {
            setEnrolling(false);
        }
    };

    // Filtrar asignaturas por año (memoizado para performance)
    const filteredSubjects = useMemo(() => {
        if (selectedYear === 'all') {
            return subjects;
        }
        return subjects.filter(subject => subject.courseYear === selectedYear);
    }, [subjects, selectedYear]);

    // Obtener años únicos (memoizado)
    const availableYears = useMemo(() => {
        return Array.from(new Set(subjects.map(s => s.courseYear))).sort();
    }, [subjects]);

    // Limpiar selección
    const clearSelection = () => {
        setSelectedSubject(null);
        setSubjectGroups([]);
    };

    // Cambiar año seleccionado
    const changeYear = (year: number | 'all') => {
        setSelectedYear(year);
        clearSelection();
    };

    // Verificar si un grupo está disponible para inscripción
    const isGroupAvailable = (group: CourseGroup): boolean => {
        return group.status === 'ACTIVE' &&
            group.enrolledStudents < group.maxCapacity;
    };

    // Obtener mensaje de disponibilidad del grupo
    const getGroupAvailabilityMessage = (group: CourseGroup): string => {
        if (group.status !== 'ACTIVE') {
            return 'No disponible';
        }
        if (group.enrolledStudents >= group.maxCapacity) {
            return 'Grupo lleno';
        }
        const spotsLeft = group.maxCapacity - group.enrolledStudents;
        return `${spotsLeft} cupos disponibles`;
    };

    return {
        // Estado
        subjects,
        filteredSubjects,
        selectedYear,
        selectedSubject,
        subjectGroups,
        availableYears,
        loading,
        loadingGroups,
        enrolling,
        error,
        enrollmentStatus,

        // Acciones
        fetchSubjectGroups,
        enrollInGroup,
        changeYear,
        clearSelection,
        refresh: fetchSubjects,

        // Utilidades
        isGroupAvailable,
        getGroupAvailabilityMessage
    };
};