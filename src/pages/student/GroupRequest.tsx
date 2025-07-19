import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../api/student.api';
import type { GroupRequest, Subject } from '../../types/student.types';
import './GroupRequest.css';

export const GroupRequests: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                studentApi.getMyGroupRequests(),
                studentApi.getMySubjects()
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

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setRequestStatus('Enviando solicitud...');
            const response = await studentApi.createGroupRequest({
                subjectId: parseInt(newRequest.subjectId),
                comments: newRequest.comments || undefined
            });

            if (response.success) {
                setRequestStatus('Solicitud enviada exitosamente');
                setIsCreatingRequest(false);
                setNewRequest({ subjectId: '', comments: '' });

                // Recargar las solicitudes
                await fetchData();

                setTimeout(() => setRequestStatus(null), 3000);
            } else {
                setRequestStatus(response.message || 'Error al enviar la solicitud');
                setTimeout(() => setRequestStatus(null), 5000);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al enviar la solicitud';
            setRequestStatus(errorMessage);
            setTimeout(() => setRequestStatus(null), 5000);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filtrar asignaturas que no tienen solicitud pendiente
    const getAvailableSubjects = () => {
        const requestedSubjectIds = requests
            .filter(r => r.status === 'PENDING')
            .map(r => r.subjectId);

        return subjects.filter(s => !requestedSubjectIds.includes(s.id));
    };

    // Estadísticas
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length
    };

    return (
        <div className="group-requests-container">
            <header className="group-requests-header">
                <div className="header-content">
                    <h1>ACAInfo - Solicitudes de Grupo</h1>
                    <div className="header-actions">
                        <span className="user-name">Hola, {user?.name}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <nav className="group-requests-nav">
                <ul>
                    <li>
                        <a href="#" onClick={() => navigate('/student/dashboard')} className="nav-link">
                            Inicio
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/subjects')} className="nav-link">
                            Asignaturas
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/enrollments')} className="nav-link">
                            Mis Inscripciones
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/profile')} className="nav-link">
                            Mi Perfil
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link active">Solicitudes de Grupo</a>
                    </li>
                </ul>
            </nav>

            <main className="group-requests-main">
                <div className="requests-header-section">
                    <h2>Solicitudes de Creación de Grupo</h2>
                    {!isCreatingRequest && getAvailableSubjects().length > 0 && (
                        <button
                            className="new-request-btn"
                            onClick={() => setIsCreatingRequest(true)}
                        >
                            Nueva Solicitud
                        </button>
                    )}
                </div>

                {/* Estadísticas */}
                {requests.length > 0 && (
                    <div className="request-stats">
                        <div className="stat-card">
                            <h3>{stats.total}</h3>
                            <p>Total Solicitudes</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.pending}</h3>
                            <p>Pendientes</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.approved}</h3>
                            <p>Aprobadas</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.rejected}</h3>
                            <p>Rechazadas</p>
                        </div>
                    </div>
                )}

                {requestStatus && (
                    <div className={`request-status ${requestStatus.includes('exitosamente') ? 'success' : 'error'}`}>
                        {requestStatus}
                    </div>
                )}

                {/* Formulario de nueva solicitud */}
                {isCreatingRequest && (
                    <div className="new-request-form-container">
                        <h3>Nueva Solicitud de Grupo</h3>
                        <form onSubmit={handleSubmitRequest} className="new-request-form">
                            <div className="form-group">
                                <label htmlFor="subjectId">Asignatura *</label>
                                <select
                                    id="subjectId"
                                    name="subjectId"
                                    value={newRequest.subjectId}
                                    onChange={handleInputChange}
                                    className={formErrors.subjectId ? 'error' : ''}
                                >
                                    <option value="">Selecciona una asignatura</option>
                                    {getAvailableSubjects().map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name} - Año {subject.courseYear}
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
                                        Puedes indicar preferencias de horario, profesor, etc.
                                    </span>
                                </label>
                                <textarea
                                    id="comments"
                                    name="comments"
                                    value={newRequest.comments}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Ej: Prefiero horario vespertino, necesito grupo intensivo..."
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

                {loading ? (
                    <div className="loading">Cargando solicitudes...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : requests.length === 0 && !isCreatingRequest ? (
                    <div className="no-requests">
                        <h3>No tienes solicitudes registradas</h3>
                        <p>
                            Cuando una asignatura no tiene grupos disponibles,
                            puedes solicitar que se abra uno nuevo.
                        </p>
                        {getAvailableSubjects().length > 0 ? (
                            <button
                                className="create-first-btn"
                                onClick={() => setIsCreatingRequest(true)}
                            >
                                Crear Primera Solicitud
                            </button>
                        ) : (
                            <p className="info-message">
                                Ya tienes solicitudes pendientes para todas las asignaturas disponibles.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="requests-grid">
                        {requests.map(request => (
                            <div key={request.id} className="request-card">
                                <div className="request-header">
                                    <h3>{request.subjectName}</h3>
                                    {getStatusBadge(request.status)}
                                </div>

                                <div className="request-info">
                                    <div className="info-row">
                                        <span className="label">Fecha de solicitud:</span>
                                        <span className="value">{formatDate(request.createdAt)}</span>
                                    </div>

                                    {request.comments && (
                                        <div className="comments-section">
                                            <span className="label">Tus comentarios:</span>
                                            <p className="comments-text">{request.comments}</p>
                                        </div>
                                    )}

                                    {request.adminComments && (
                                        <div className="admin-comments-section">
                                            <span className="label">Respuesta del administrador:</span>
                                            <p className="admin-comments-text">{request.adminComments}</p>
                                        </div>
                                    )}
                                </div>

                                {request.status === 'APPROVED' && (
                                    <div className="request-actions">
                                        <button
                                            className="view-groups-btn"
                                            onClick={() => navigate('/student/subjects')}
                                        >
                                            Ver Grupos Disponibles
                                        </button>
                                    </div>
                                )}

                                {request.status === 'PENDING' && (
                                    <div className="pending-info">
                                        <p>Tu solicitud está siendo revisada por el administrador.</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};