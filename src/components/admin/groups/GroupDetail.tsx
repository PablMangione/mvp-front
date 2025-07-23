// src/components/admin/groups/GroupDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupManagementService } from '../../../services/admin';
import type { CourseGroupDto, GroupSessionDto } from '../../../types/admin.types';
import './GroupDetail.css';

/**
 * Componente para la vista detallada de un grupo.
 *
 * Muestra toda la información relevante del grupo incluyendo:
 * - Información general (asignatura, profesor, estado)
 * - Estadísticas (capacidad, inscripciones)
 * - Horario semanal con las sesiones
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

    // Formatear estado
    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { text: string; className: string }> = {
            'PLANNED': { text: 'Planificado', className: 'badge badge--planned' },
            'ACTIVE': { text: 'Activo', className: 'badge badge--active' },
            'CLOSED': { text: 'Cerrado', className: 'badge badge--closed' }
        };

        const statusInfo = statusMap[status] || { text: status, className: 'badge' };
        return <span className={statusInfo.className}>{statusInfo.text}</span>;
    };

    // Formatear tipo
    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { text: string; className: string }> = {
            'REGULAR': { text: 'Regular', className: 'badge badge--regular' },
            'INTENSIVE': { text: 'Intensivo', className: 'badge badge--intensive' }
        };

        const typeInfo = typeMap[type] || { text: type, className: 'badge' };
        return <span className={typeInfo.className}>{typeInfo.text}</span>;
    };

    // Calcular porcentaje de ocupación
    const getOccupancyPercentage = () => {
        if (!group) return 0;
        const enrolled = group.enrolledStudents || 0;
        const max = group.maxCapacity || 1;
        return Math.round((enrolled / max) * 100);
    };

    // Estado de carga
    if (loadingGroup) {
        return (
            <div className="group-detail">
                <div className="group-detail__loading">
                    <div className="spinner"></div>
                    <p>Cargando información del grupo...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (groupError || !group) {
        return (
            <div className="group-detail">
                <div className="group-detail__error">
                    <p>{groupError || 'Grupo no encontrado'}</p>
                    <button
                        onClick={() => navigate('/admin/groups')}
                        className="btn btn--primary"
                    >
                        Volver a la lista
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group-detail">
            {/* Header con navegación */}
            <div className="group-detail__header">
                <div className="group-detail__breadcrumb">
                    <button
                        onClick={() => navigate('/admin/groups')}
                        className="breadcrumb__link"
                    >
                        ← Grupos
                    </button>
                    <span className="breadcrumb__separator">/</span>
                    <span className="breadcrumb__current">Grupo #{group.id}</span>
                </div>

                <div className="group-detail__actions">
                    <button
                        onClick={() => navigate(`/admin/groups/${group.id}/edit`)}
                        className="btn btn--secondary"
                    >
                        ✏️ Editar
                    </button>
                </div>
            </div>

            {/* Información principal */}
            <div className="group-detail__main">
                <h1 className="group-detail__title">{group.subjectName}</h1>
                <p className="group-detail__subtitle">Grupo #{group.id}</p>
            </div>

            {/* Grid de información */}
            <div className="group-detail__grid">
                {/* Información general */}
                <div className="info-card">
                    <h2 className="info-card__title">Información General</h2>
                    <div className="info-card__content">
                        <div className="info-row">
                            <span className="info-label">Estado:</span>
                            <span>{getStatusBadge(group.status)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Tipo:</span>
                            <span>{getTypeBadge(group.type)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Profesor:</span>
                            <span className={!group.teacherId ? 'text-warning' : ''}>
                                {group.teacherName || 'Sin asignar'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Precio:</span>
                            <span className="text-success">${group.price || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas de capacidad */}
                <div className="info-card">
                    <h2 className="info-card__title">Capacidad</h2>
                    <div className="info-card__content">
                        <div className="capacity-visual">
                            <div className="capacity-number">
                                {group.enrolledStudents || 0} / {group.maxCapacity || 0}
                            </div>
                            <div className="capacity-label">Estudiantes inscritos</div>
                            <div className="capacity-bar">
                                <div
                                    className="capacity-bar__fill"
                                    style={{ width: `${getOccupancyPercentage()}%` }}
                                />
                            </div>
                            <div className="capacity-percentage">
                                {getOccupancyPercentage()}% ocupado
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones rápidas */}
                <div className="info-card">
                    <h2 className="info-card__title">Acciones Rápidas</h2>
                    <div className="info-card__content">
                        <button
                            className="action-btn"
                            disabled={group.status !== 'PLANNED'}
                            title={group.status !== 'PLANNED' ? 'Solo grupos planificados' : ''}
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
                    {!showSchedule && (
                        <button
                            onClick={loadSessions}
                            className="btn btn--primary"
                            disabled={loadingSessions}
                        >
                            {loadingSessions ? 'Cargando...' : '📅 Ver Horario'}
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
                            <WeeklyScheduleGrid
                                sessions={sessions}
                                groupName={group.subjectName}
                                teacherName={group.teacherName}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

/**
 * Componente interno para mostrar el horario semanal.
 * Específico para la vista de grupos.
 */
const WeeklyScheduleGrid: React.FC<{
    sessions: GroupSessionDto[];
    groupName: string;
    teacherName?: string;
}> = ({ sessions, groupName, teacherName }) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const hours = [];

    // Generar horas de 8:00 a 22:00
    for (let h = 8; h < 22; h++) {
        hours.push(`${h}:00`);
        hours.push(`${h}:30`);
    }

    // Mapeo de días
    const dayMap: Record<string, number> = {
        'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3,
        'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
    };

    // Convertir tiempo a minutos
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    // Calcular posición de una sesión
    const getSessionPosition = (session: GroupSessionDto) => {
        const dayIndex = dayMap[session.dayOfWeek] || 0;
        const startMinutes = timeToMinutes(session.startTime);
        const endMinutes = timeToMinutes(session.endTime);
        const baseMinutes = 8 * 60; // 8:00 AM

        const startRow = Math.floor((startMinutes - baseMinutes) / 30) + 2;
        const duration = endMinutes - startMinutes;
        const rowSpan = Math.ceil(duration / 30);

        return {
            gridColumn: dayIndex + 2,
            gridRow: `${startRow} / span ${rowSpan}`
        };
    };

    return (
        <div className="schedule-grid">
            {/* Esquina vacía */}
            <div className="schedule-grid__corner"></div>

            {/* Headers de días */}
            {days.map(day => (
                <div key={day} className="schedule-grid__day-header">
                    {day}
                </div>
            ))}

            {/* Columna de horas */}
            {hours.map((hour, idx) => (
                <div
                    key={hour}
                    className={`schedule-grid__time ${idx % 2 === 0 ? 'time--hour' : 'time--half'}`}
                >
                    {hour}
                </div>
            ))}

            {/* Celdas vacías */}
            {hours.map((_, rowIdx) =>
                days.map((_, colIdx) => (
                    <div
                        key={`${rowIdx}-${colIdx}`}
                        className={`schedule-grid__cell ${rowIdx % 2 === 0 ? 'cell--hour' : ''}`}
                    />
                ))
            )}

            {/* Sesiones */}
            {sessions.map(session => (
                <div
                    key={session.id}
                    className="schedule-grid__session"
                    style={getSessionPosition(session)}
                    title={`${groupName} - ${session.classroom}`}
                >
                    <div className="session-time">
                        {session.startTime.substring(0, 5)} - {session.endTime.substring(0, 5)}
                    </div>
                    <div className="session-room">📍 {session.classroom}</div>
                </div>
            ))}
        </div>
    );
};