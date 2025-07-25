// src/components/admin/groups/GroupDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupManagementService } from '../../../services/admin';
import { WeeklySchedule, type ScheduleSession } from '../../common';
import type { CourseGroupDto, GroupSessionDto } from '../../../types/admin.types';
import { StudentListModal } from '../modals/StudentListModal';
import { SessionModal } from '../modals/SessionModal';
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

    const [showStudentModal, setShowStudentModal] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [showSessionModal, setShowSessionModal] = useState(false);
    const [addingSession, setAddingSession] = useState(false);

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

    // Cargar estudiantes del grupo
    const loadStudents = async () => {
        if (!id) return;

        try {
            setLoadingStudents(true);
            const data = await groupManagementService.getStudentsByGroup(parseInt(id));
            setStudents(data);
            setShowStudentModal(true);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            alert('No se pudieron cargar los estudiantes del grupo.');
        } finally {
            setLoadingStudents(false);
        }
    };

    // Manejar agregar nueva sesión
    const handleAddSession = async (sessionData: any) => {
        if (!id) return;

        try {
            setAddingSession(true);
            await groupManagementService.addGroupSession(parseInt(id), sessionData);

            // Recargar las sesiones
            await loadSessions();

            setShowSessionModal(false);
            alert('Sesión agregada exitosamente');
        } catch (error) {
            console.error('Error al agregar sesión:', error);
            alert('Error al agregar la sesión. Por favor intente nuevamente.');
        } finally {
            setAddingSession(false);
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
                            className="btn btn--secondary"
                            onClick={loadStudents}
                            disabled={loadingStudents || group.enrolledStudents === 0}
                        >
                            {loadingStudents ? 'Cargando...' : 'Mostrar Estudiantes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowSessionModal(true)}
                            className="btn btn--small btn--secondary"
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
            {/* Modal de estudiantes */}
            <StudentListModal
                isOpen={showStudentModal}
                onClose={() => setShowStudentModal(false)}
                students={students}
                groupName={`${group.subjectName} - Grupo ${group.id}`}
            />
            {/* Modal de agregar sesión */}
            {showSessionModal && (
                <SessionModal
                    isOpen={showSessionModal}
                    onClose={() => setShowSessionModal(false)}
                    onSave={handleAddSession}
                    groupId={parseInt(id!)}
                    saving={addingSession}
                />
            )}
        </div>
    );
};