// src/hooks/student/useGroupRequests.ts
import { useState, useEffect, useMemo } from 'react';
import { groupRequestService, subjectService } from '../../services/student';
import type { GroupRequest, Subject, CreateGroupRequest } from '../../types/student.types';

interface GroupRequestFormData {
    subjectId: string;
    comments: string;
}

/**
 * Hook personalizado para gestionar solicitudes de grupo.
 *
 * Funcionalidades:
 * - Crear nuevas solicitudes
 * - Ver estado de solicitudes
 * - Validación de solicitudes duplicadas
 * - Filtrado de asignaturas disponibles
 */
export const useGroupRequests = () => {
    // Estado principal
    const [requests, setRequests] = useState<GroupRequest[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Estado del formulario
    const [isCreatingRequest, setIsCreatingRequest] = useState(false);
    const [formData, setFormData] = useState<GroupRequestFormData>({
        subjectId: '',
        comments: ''
    });

    // Estados de error y feedback
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [requestStatus, setRequestStatus] = useState<string | null>(null);

    // Cargar datos al montar
    useEffect(() => {
        fetchData();
    }, []);

    // Fetch datos iniciales
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar solicitudes y asignaturas en paralelo
            const [requestsData, subjectsData] = await Promise.all([
                groupRequestService.getMyGroupRequests(),
                subjectService.getMySubjects()
            ]);
            console.debug('Solicitudes', requestsData);

            setRequests(requestsData);
            setSubjects(subjectsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    // Actualizar datos del formulario
    const updateFormData = (field: keyof GroupRequestFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo
        if (formErrors[field]) {
            setFormErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    // Validar formulario
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.subjectId) {
            errors.subjectId = 'Debes seleccionar una asignatura';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Crear nueva solicitud
    const createRequest = async () => {
        if (!validateForm()) {
            return false;
        }

        try {
            setSubmitting(true);
            setRequestStatus('Enviando solicitud...');

            // Verificar si puede solicitar
            const canRequest = await groupRequestService.canRequestGroup(Number(formData.subjectId));

            if (!canRequest) {
                setRequestStatus('Ya tienes una solicitud pendiente para esta asignatura');
                setTimeout(() => setRequestStatus(null), 5000);
                return false;
            }

            // Crear la solicitud
            const requestData: CreateGroupRequest = {
                subjectId: Number(formData.subjectId),
                comments: formData.comments || undefined
            };

            await groupRequestService.createGroupRequest(requestData);

            setRequestStatus('¡Solicitud enviada exitosamente!');
            setIsCreatingRequest(false);
            resetForm();

            // Recargar solicitudes
            await fetchData();

            setTimeout(() => setRequestStatus(null), 3000);
            return true;

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al enviar la solicitud';
            setRequestStatus(errorMessage);
            setTimeout(() => setRequestStatus(null), 5000);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            subjectId: '',
            comments: ''
        });
        setFormErrors({});
    };

    // Cancelar creación
    const cancelCreate = () => {
        setIsCreatingRequest(false);
        resetForm();
    };

    // Filtrar asignaturas disponibles (sin solicitud pendiente)
    const availableSubjects = useMemo(() => {
        return subjects.filter(subject =>
            !requests.some(request =>
                request.subjectId === subject.id &&
                request.status === 'PENDING'
            )
        );
    }, [subjects, requests]);

    // Estadísticas de solicitudes
    const requestStats = useMemo(() => {
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'PENDING').length,
            approved: requests.filter(r => r.status === 'APPROVED').length,
            rejected: requests.filter(r => r.status === 'REJECTED').length
        };
    }, [requests]);

    // Obtener info del estado
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Pendiente', className: 'pending', color: '#f39c12' };
            case 'APPROVED':
                return { label: 'Aprobada', className: 'approved', color: '#27ae60' };
            case 'REJECTED':
                return { label: 'Rechazada', className: 'rejected', color: '#e74c3c' };
            default:
                return { label: status, className: '', color: '#7f8c8d' };
        }
    };

    // Formatear fecha
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Filtrar solicitudes por estado
    const filterByStatus = (status?: string) => {
        if (!status) return requests;
        return requests.filter(r => r.status === status);
    };

    // Ordenar solicitudes
    const sortRequests = (by: 'date' | 'subject' | 'status' = 'date') => {
        const sorted = [...requests];
        switch (by) {
            case 'date':
                return sorted.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            case 'subject':
                return sorted.sort((a, b) =>
                    a.subjectName.localeCompare(b.subjectName)
                );
            case 'status':
                // Ordenar: PENDING primero, luego APPROVED, luego REJECTED
                const statusOrder = { 'PENDING': 0, 'APPROVED': 1, 'REJECTED': 2 };
                return sorted.sort((a, b) =>
                    statusOrder[a.status] - statusOrder[b.status]
                );
            default:
                return sorted;
        }
    };

    return {
        // Estado
        requests,
        subjects,
        availableSubjects,
        loading,
        submitting,
        error,
        isCreatingRequest,
        formData,
        formErrors,
        requestStatus,
        requestStats,

        // Acciones
        setIsCreatingRequest,
        updateFormData,
        createRequest,
        cancelCreate,
        refresh: fetchData,

        // Utilidades
        getStatusInfo,
        formatDate,
        filterByStatus,
        sortRequests,

        // Computed
        hasRequests: requests.length > 0,
        hasPendingRequests: requestStats.pending > 0,
        canCreateRequest: availableSubjects.length > 0
    };
};