// src/pages/student/GroupRequest.tsx
import React, { useState, useEffect } from 'react';
import {groupRequestService, subjectService} from '../../services/student';
import type { GroupRequest, Subject } from '../../types/student.types';
import './GroupRequest.css';

/**
 * Página de solicitudes de grupo - REFACTORIZADA
 * Removido: header, nav y logout (ahora en StudentLayout)
 */
export const GroupRequests: React.FC = () => {
    const [requests, setRequests] = useState<GroupRequest[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingRequest, setIsCreatingRequest] = useState(false);
    const [requestStatus, setRequestStatus] = useState<string | null>(null);

    // Form data para nueva solicitud
    const [newRequest, setNewRequest] = useState({
        subjectId: '',
        comments: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Cargar solicitudes y asignaturas en paralelo
            const [requestsData, subjectsData] = await Promise.all([
                groupRequestService.getMyGroupRequests(),
                subjectService.getMySubjects()
            ]);

            setRequests(requestsData);
            setSubjects(subjectsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRequest(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!newRequest.subjectId) {
            errors.subjectId = 'Debes seleccionar una asignatura';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setRequestStatus('Enviando solicitud...');

            // Verificar si puede solicitar
            const canRequest = await groupRequestService.canRequestGroup(Number(newRequest.subjectId));

            if (!canRequest) {
                setRequestStatus('Ya tienes una solicitud pendiente para esta asignatura');
                setTimeout(() => setRequestStatus(null), 5000);
                return;
            }

            // Crear la solicitud
            await groupRequestService.createGroupRequest({
                subjectId: Number(newRequest.subjectId),
                comments: newRequest.comments || undefined
            });

            setRequestStatus('¡Solicitud enviada exitosamente!');
            setIsCreatingRequest(false);
            setNewRequest({ subjectId: '', comments: '' });

            // Recargar solicitudes
            await fetchData();

            setTimeout(() => setRequestStatus(null), 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al enviar la solicitud';
            setRequestStatus(errorMessage);
            setTimeout(() => setRequestStatus(null), 5000);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="status-badge pending">Pendiente</span>;
            case 'APPROVED':
                return <span className="status-badge approved">Aprobada</span>;
            case 'REJECTED':
                return <span className="status-badge rejected">Rechazada</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Filtrar asignaturas que no tienen solicitud pendiente
    const availableSubjects = subjects.filter(subject =>
        !requests.some(request =>
            request.subjectId === subject.id &&
            request.status === 'PENDING'
        )
    );

    if (loading) {
        return (
            <div className="group-requests-container">
                <div className="loading">Cargando solicitudes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="group-requests-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="group-requests-container">
            <div className="group-requests-content">
                <div className="page-header">
                    <h2>Solicitudes de Grupo</h2>
                    <button
                        className="new-request-btn"
                        onClick={() => setIsCreatingRequest(!isCreatingRequest)}
                    >
                        {isCreatingRequest ? 'Cancelar' : 'Nueva Solicitud'}
                    </button>
                </div>

                {/* Mensaje de estado */}
                {requestStatus && (
                    <div className={`request-status ${requestStatus.includes('Error') || requestStatus.includes('Ya tienes') ? 'error' : 'success'}`}>
                        {requestStatus}
                    </div>
                )}

                {/* Formulario de nueva solicitud */}
                {isCreatingRequest && (
                    <div className="new-request-form-container">
                        <h3>Crear Nueva Solicitud</h3>
                        <form onSubmit={handleSubmit} className="new-request-form">
                            <div className="form-group">
                                <label htmlFor="subjectId">Asignatura *</label>
                                <select
                                    id="subjectId"
                                    name="subjectId"
                                    value={newRequest.subjectId}
                                    onChange={handleInputChange}
                                    className={formErrors.subjectId ? 'error' : ''}
                                    required
                                >
                                    <option value="">Selecciona una asignatura</option>
                                    {availableSubjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} - {subject.courseYear}º año
                                        </option>
                                    ))}
                                </select>
                                {formErrors.subjectId && <span className="error-text">{formErrors.subjectId}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="comments">
                                    Comentarios (opcional)
                                    <small>Explica por qué necesitas un nuevo grupo</small>
                                </label>
                                <textarea
                                    id="comments"
                                    name="comments"
                                    value={newRequest.comments}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Ej: Conflicto de horario con otra asignatura, necesito un grupo en horario vespertino..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    Enviar Solicitud
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsCreatingRequest(false);
                                        setNewRequest({ subjectId: '', comments: '' });
                                        setFormErrors({});
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de solicitudes */}
                {requests.length === 0 ? (
                    <div className="no-requests">
                        <h3>No tienes solicitudes de grupo</h3>
                        <p>Puedes solicitar la creación de nuevos grupos para asignaturas que lo necesiten.</p>
                        {!isCreatingRequest && (
                            <button
                                className="create-first-btn"
                                onClick={() => setIsCreatingRequest(true)}
                            >
                                Crear Primera Solicitud
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="requests-list">
                        <h3>Mis Solicitudes ({requests.length})</h3>
                        {requests.map(request => (
                            <div key={request.id} className="request-card">
                                <div className="request-header">
                                    <h4>{request.subjectName}</h4>
                                    {getStatusBadge(request.status)}
                                </div>

                                <div className="request-info">
                                    <p className="request-date">
                                        Solicitado el {formatDate(request.createdAt)}
                                    </p>

                                    {request.comments && (
                                        <div className="request-comments">
                                            <strong>Tus comentarios:</strong>
                                            <p>{request.comments}</p>
                                        </div>
                                    )}

                                    {request.adminComments && (
                                        <div className="admin-comments">
                                            <strong>Respuesta del administrador:</strong>
                                            <p>{request.adminComments}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};