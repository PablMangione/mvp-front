// src/pages/student/GroupRequest.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { groupRequestService, subjectService } from '../../services/student';
import { GroupRequestCard } from '../../components/student/GroupRequestCard';
import { StatsCard } from '../../components/student/StatsCard';
import type { GroupRequest, Subject } from '../../types/student.types';
import './GroupRequest.css';

/**
 * Página de solicitudes de grupo - REFACTORIZADA con componentes reutilizables
 */
export const GroupRequests: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [requests, setRequests] = useState<GroupRequest[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingRequest, setIsCreatingRequest] = useState(false);
    const [requestStatus, setRequestStatus] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form data para nueva solicitud
    const [newRequest, setNewRequest] = useState({
        subjectId: '',
        comments: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Verificar si viene de la página de subjects con una asignatura seleccionada
        if (location.state?.createNew && location.state?.selectedSubjectId) {
            setIsCreatingRequest(true);
            setNewRequest(prev => ({
                ...prev,
                subjectId: location.state.selectedSubjectId.toString()
            }));

            // Limpiar el estado para evitar que se active de nuevo al navegar
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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
            setSubmitting(true);
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
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewSubject = (subjectId: number) => {
        navigate('/student/subjects');
        // TODO: Implementar navegación directa a la asignatura específica
    };

    const handleCancelRequest = async (requestId: number) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
            return;
        }

        try {
            await groupRequestService.cancelRequest(requestId);
            setRequestStatus('Solicitud cancelada exitosamente');
            await fetchData();
            setTimeout(() => setRequestStatus(null), 3000);
        } catch (error) {
            setRequestStatus('Error al cancelar la solicitud');
            setTimeout(() => setRequestStatus(null), 5000);
        }
    };

    // Filtrar asignaturas que no tienen solicitud pendiente
    const availableSubjects = subjects.filter(subject =>
        !requests.some(request =>
            request.subjectId === subject.id &&
            request.status === 'PENDING'
        )
    );

    // Calcular estadísticas
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length
    };

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
                <div className="requests-header-section">
                    <h2>Solicitudes de Grupo</h2>
                    <button
                        className="new-request-btn"
                        onClick={() => setIsCreatingRequest(!isCreatingRequest)}
                        disabled={availableSubjects.length === 0}
                    >
                        {isCreatingRequest ? 'Cancelar' : 'Nueva Solicitud'}
                    </button>
                </div>

                {/* Estadísticas usando StatsCard */}
                {requests.length > 0 && (
                    <div className="stats-card-grid">
                        <StatsCard
                            title="Total Solicitudes"
                            value={stats.total}
                            description="Solicitudes realizadas"
                            icon="📋"
                        />
                        <StatsCard
                            title="Pendientes"
                            value={stats.pending}
                            description="En revisión"
                            icon="⏳"
                        />
                        <StatsCard
                            title="Aprobadas"
                            value={stats.approved}
                            description="Grupos por abrir"
                            icon="✅"
                        />
                        {stats.rejected > 0 && (
                            <StatsCard
                                title="Rechazadas"
                                value={stats.rejected}
                                description="No procedieron"
                                icon="❌"
                            />
                        )}
                    </div>
                )}

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
                        {location.state?.selectedSubjectId && (
                            <div className="info-message" style={{
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                marginBottom: '1rem'
                            }}>
                                ℹ️ Has seleccionado esta asignatura desde la página de asignaturas
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="new-request-form">
                            <div className="form-group">
                                <label htmlFor="subjectId">
                                    Asignatura *
                                    <span className="field-hint">
                                        Selecciona la asignatura para la que necesitas un grupo
                                    </span>
                                </label>
                                <select
                                    id="subjectId"
                                    name="subjectId"
                                    value={newRequest.subjectId}
                                    onChange={handleInputChange}
                                    className={formErrors.subjectId ? 'error' : ''}
                                    required
                                    disabled={submitting}
                                >
                                    <option value="">Selecciona una asignatura</option>
                                    {availableSubjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} - {subject.courseYear}º año
                                        </option>
                                    ))}
                                </select>
                                {formErrors.subjectId && (
                                    <span className="field-error">{formErrors.subjectId}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="comments">
                                    Comentarios (opcional)
                                    <span className="field-hint">
                                        Explica por qué necesitas un nuevo grupo
                                    </span>
                                </label>
                                <textarea
                                    id="comments"
                                    name="comments"
                                    value={newRequest.comments}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Ej: Conflicto de horario con otra asignatura, necesito un grupo en horario vespertino..."
                                    disabled={submitting}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsCreatingRequest(false);
                                        setNewRequest({ subjectId: '', comments: '' });
                                        setFormErrors({});
                                    }}
                                    disabled={submitting}
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
                        {!isCreatingRequest && availableSubjects.length > 0 && (
                            <button
                                className="create-first-btn"
                                onClick={() => setIsCreatingRequest(true)}
                            >
                                Crear Primera Solicitud
                            </button>
                        )}
                        {availableSubjects.length === 0 && (
                            <p className="info-message">
                                No hay asignaturas disponibles para solicitar grupos nuevos.
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Solicitudes pendientes */}
                        {stats.pending > 0 && (
                            <section className="requests-section">
                                <h3 className="section-title">⏳ Solicitudes Pendientes</h3>
                                <div className="requests-grid">
                                    {requests
                                        .filter(r => r.status === 'PENDING')
                                        .map(request => (
                                            <GroupRequestCard
                                                key={request.id}
                                                request={request}
                                                onCancel={handleCancelRequest}
                                            />
                                        ))}
                                </div>
                            </section>
                        )}

                        {/* Solicitudes aprobadas */}
                        {stats.approved > 0 && (
                            <section className="requests-section">
                                <h3 className="section-title">✅ Solicitudes Aprobadas</h3>
                                <div className="requests-grid">
                                    {requests
                                        .filter(r => r.status === 'APPROVED')
                                        .map(request => (
                                            <GroupRequestCard
                                                key={request.id}
                                                request={request}
                                                onViewSubject={handleViewSubject}
                                            />
                                        ))}
                                </div>
                            </section>
                        )}

                        {/* Solicitudes rechazadas */}
                        {stats.rejected > 0 && (
                            <section className="requests-section">
                                <h3 className="section-title">❌ Solicitudes Rechazadas</h3>
                                <div className="requests-grid">
                                    {requests
                                        .filter(r => r.status === 'REJECTED')
                                        .map(request => (
                                            <GroupRequestCard
                                                key={request.id}
                                                request={request}
                                            />
                                        ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};