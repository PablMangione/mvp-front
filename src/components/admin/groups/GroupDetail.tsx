// src/components/admin/groups/GroupDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupManagementService } from '../../../services/admin';
import { WeeklySchedule, type ScheduleSession } from '../../common/WeeklySchedule';
import type { CourseGroupDto, GroupSessionDto } from '../../../types/admin.types';
import './GroupDetail.css';

/**
 * Componente para la vista detallada de un grupo.
 *
 * Muestra toda la información relevante del grupo incluyendo:
 * - Información general (asignatura, profesor, estado)
 * - Estadísticas (capacidad, inscripciones)
 * - Horario semanal con las sesiones usando el componente reutilizable
 * - Acciones disponibles
 */
export const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Estados principales
    const [group, setGroup] = useState<CourseGroupDto | null>(null);
    const [sessions, setSessions] = useState<GroupSessionDto[]>([]);
    const [showSchedule, setShowSchedule] = useState(false);

    // Estados de carga
    const [loadingGroup, setLoadingGroup] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);

    // Estados de error
    const [groupError, setGroupError] = useState<string | null>(null);
    const [sessionsError, setSessionsError] = useState<string | null>(null);

    // Cargar información del grupo al montar
    useEffect(() => {
        if (id) {
            loadGroupData(parseInt(id));
        }
    }, [id]);

    // Cargar datos del grupo
    const loadGroupData = async (groupId: number) => {
        try {
            setLoadingGroup(true);
            setGroupError(null);

            const data = await groupManagementService.getGroupById(groupId);
            setGroup(data);
        } catch (error) {
            console.error('Error al cargar el grupo:', error);
            setGroupError('No se pudo cargar la información del grupo.');
        } finally {
            setLoadingGroup(false);
        }
    };

    // Cargar sesiones del grupo
    const loadSessions = async () => {
        if (!id) return;

        try {
            setLoadingSessions(true);
            setSessionsError(null);

            const data = await groupManagementService.getGroupSessions(parseInt(id));
            setSessions(data);
            setShowSchedule(true);
        } catch (error) {
            console.error('Error al cargar las sesiones:', error);
            setSessionsError('No se pudieron cargar las sesiones del grupo.');
        } finally {
            setLoadingSessions(false);
        }
    };

    // Ocultar horario
    const hideSchedule = () => {
        setShowSchedule(false);
    };

    // Transformar sesiones al formato del componente WeeklySchedule
    const transformSessions = (sessions: GroupSessionDto[]): ScheduleSession[] => {
        return sessions.map(session => ({
            id: session.id,
            dayOfWeek: session.dayOfWeek,
            startTime: session.startTime,
            endTime: session.endTime,
            classroom: session.classroom,
            title: group?.subjectName,
            subtitle: group?.teacherName
        }));
    };

    // Manejar click en sesión
    const handleSessionClick = (session: ScheduleSession) => {
        // Aquí puedes agregar lógica para editar o ver detalles de la sesión
        console.log('Sesión clickeada:', session);
        // navigate(`/admin/groups/${id}/sessions/${session.id}/edit`);
    };

    // Estados de carga
    if (loadingGroup) {
        return (
            <div className="group-detail__container">
                <div className="loading-spinner">Cargando información del grupo...</div>
            </div>
        );
    }

    if (groupError || !group) {
        return (
            <div className="group-detail__container">
                <div className="error-message">{groupError || 'Grupo no encontrado'}</div>
                <button onClick={() => navigate('/admin/groups')} className="btn btn--secondary">
                    Volver a la lista
                </button>
            </div>
        );
    }

    // Calcular porcentaje de ocupación
    const occupancy = group.maxCapacity > 0
        ? Math.round((group.enrolledStudents / group.maxCapacity) * 100)
        : 0;

    // Mapeo de tipos
    const typeLabels = {
        REGULAR: 'Regular',
        INTENSIVE: 'Intensivo'
    };

    // Mapeo de estados
    const statusConfig = {
        PLANNED: { label: 'Planificado', color: 'status--warning' },
        ACTIVE: { label: 'Activo', color: 'status--success' },
        CLOSED: { label: 'Cerrado', color: 'status--error' }
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <div className="group-detail__container">
            {/* Header con navegación */}
            <div className="group-detail__header">
                <button
                    onClick={() => navigate('/admin/groups')}
                    className="btn btn--ghost"
                >
                    ← Volver a grupos
                </button>
                <h1>Detalles del Grupo</h1>
            </div>

            {/* Grid de información */}
            <div className="group-detail__grid">
                {/* Información básica */}
                <div className="info-card">
                    <h2>Información General</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Asignatura:</span>
                            <span className="info-value">{group.subjectName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Profesor:</span>
                            <span className={`info-value ${!group.teacherName ? 'text-warning' : ''}`}>
                                {group.teacherName || 'Sin asignar'}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Tipo:</span>
                            <span className="info-value">{typeLabels[group.type]}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Estado:</span>
                            <span className={`status-badge ${statusConfig[group.status].color}`}>
                                {statusConfig[group.status].label}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Precio:</span>
                            <span className="info-value text-success">${group.price}</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="info-card">
                    <h2>Estadísticas</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-label">Estudiantes inscritos</div>
                            <div className="stat-value">{group.enrolledStudents}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Capacidad máxima</div>
                            <div className="stat-value">{group.maxCapacity}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Ocupación</div>
                            <div className="stat-value">{occupancy}%</div>
                            <div className="occupancy-bar">
                                <div
                                    className="occupancy-bar__fill"
                                    style={{ width: `${occupancy}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="info-card">
                    <h2>Acciones</h2>
                    <div className="actions-grid">
                        <button
                            className="action-btn"
                            onClick={() => navigate(`/admin/groups/${group.id}/edit`)}
                        >
                            ✏️ Editar Grupo
                        </button>
                        <button
                            className="action-btn"
                            disabled={group.status !== 'PLANNED' || !group.teacherId}
                            title={
                                group.status !== 'PLANNED' ? 'Solo grupos planificados' :
                                    !group.teacherId ? 'Asigna un profesor primero' : ''
                            }
                        >
                            🚀 Activar Grupo
                        </button>
                        <button
                            className="action-btn"
                            disabled={!!group.teacherId}
                            title={group.teacherId ? 'Ya tiene profesor asignado' : ''}
                        >
                            👨‍🏫 Asignar Profesor
                        </button>
                        <button
                            className="action-btn"
                            onClick={() => navigate(`/admin/groups/${group.id}/students`)}
                        >
                            👥 Ver Estudiantes
                        </button>
                        <button
                            className="action-btn"
                            onClick={() => navigate(`/admin/groups/${group.id}/sessions/new`)}
                        >
                            ➕ Añadir Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Sección de horario */}
            <div className="group-detail__schedule-section">
                <div className="schedule-header">
                    <h2>Horario Semanal</h2>
                    {!showSchedule ? (
                        <button
                            onClick={loadSessions}
                            className="btn btn--primary"
                            disabled={loadingSessions}
                        >
                            {loadingSessions ? 'Cargando...' : '📅 Ver Horario'}
                        </button>
                    ) : (
                        <button
                            onClick={hideSchedule}
                            className="btn btn--secondary"
                        >
                            👁️‍🗨️ Ocultar Horario
                        </button>
                    )}
                </div>

                {showSchedule && (
                    <>
                        {sessionsError && (
                            <div className="error-message">{sessionsError}</div>
                        )}

                        {sessions.length === 0 ? (
                            <div className="empty-schedule">
                                <p>No hay sesiones programadas para este grupo</p>
                                <button
                                    onClick={() => navigate(`/admin/groups/${group.id}/sessions/new`)}
                                    className="btn btn--primary"
                                >
                                    Añadir Primera Sesión
                                </button>
                            </div>
                        ) : (
                            <WeeklySchedule
                                sessions={transformSessions(sessions)}
                                startHour={8}
                                endHour={22}
                                showWeekends={true}
                                height="600px"
                                onSessionClick={handleSessionClick}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};