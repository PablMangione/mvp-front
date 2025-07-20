// src/components/student/GroupCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CourseGroup } from '../../types/student.types';
import './GroupCard.css';

interface GroupCardProps {
    group: CourseGroup;
    onEnroll?: (groupId: number) => void;
    onViewDetails?: (group: CourseGroup) => void;
    isEnrolling?: boolean;
    canEnroll?: boolean;
}

/**
 * Componente reutilizable para mostrar información de un grupo
 * Usado en la página de Subjects para mostrar grupos disponibles
 */
export const GroupCard: React.FC<GroupCardProps> = ({
                                                        group,
                                                        onEnroll,
                                                        onViewDetails,
                                                        isEnrolling = false,
                                                        canEnroll = true
                                                    }) => {
    const navigate = useNavigate();
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return { label: 'Activo', className: 'active', icon: '●' };
            case 'PLANNED':
                return { label: 'Planificado', className: 'planned', icon: '○' };
            case 'CLOSED':
                return { label: 'Cerrado', className: 'closed', icon: '✗' };
            default:
                return { label: status, className: '', icon: '?' };
        }
    };

    const getTypeInfo = (type: string) => {
        return type === 'REGULAR'
            ? { label: 'Regular', className: 'regular' }
            : { label: 'Intensivo', className: 'intensive' };
    };

    const getDayName = (day: string) => {
        const days: Record<string, string> = {
            'MONDAY': 'Lunes',
            'TUESDAY': 'Martes',
            'WEDNESDAY': 'Miércoles',
            'THURSDAY': 'Jueves',
            'FRIDAY': 'Viernes',
            'SATURDAY': 'Sábado',
            'SUNDAY': 'Domingo'
        };
        return days[day] || day;
    };

    const statusInfo = getStatusInfo(group.status);
    const typeInfo = getTypeInfo(group.type);
    const spotsLeft = group.maxCapacity - group.enrolledStudents;
    const isFull = spotsLeft <= 0;
    const isAvailable = group.status === 'ACTIVE' && !isFull && canEnroll;

    return (
        <div className="group-card">
            <div className="group-card__header">
                <div className="group-card__title-section">
                    <h4 className="group-card__title">Grupo {group.id}</h4>
                    <div className="group-card__badges">
                        <span className={`group-card__status ${statusInfo.className}`}>
                            <span className="group-card__status-icon">{statusInfo.icon}</span>
                            {statusInfo.label}
                        </span>
                        <span className={`group-card__type ${typeInfo.className}`}>
                            {typeInfo.label}
                        </span>
                    </div>
                </div>
            </div>

            <div className="group-card__content">
                <div className="group-card__info">
                    <div className="group-card__info-item">
                        <span className="group-card__info-label">Profesor:</span>
                        <span className="group-card__info-value">{group.teacherName}</span>
                    </div>

                    <div className="group-card__info-item">
                        <span className="group-card__info-label">Precio:</span>
                        <span className="group-card__info-value group-card__price">
                            ${group.price.toLocaleString()}
                        </span>
                    </div>

                    <div className="group-card__info-item">
                        <span className="group-card__info-label">Cupos:</span>
                        <span className={`group-card__info-value ${isFull ? 'group-card__full' : ''}`}>
                            {group.enrolledStudents}/{group.maxCapacity}
                            {!isFull && (
                                <span className="group-card__spots-left">
                                    ({spotsLeft} disponibles)
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {group.sessions && group.sessions.length > 0 && (
                    <div className="group-card__schedule">
                        <h5 className="group-card__schedule-title">Horario:</h5>
                        <div className="group-card__sessions">
                            {group.sessions.map((session, index) => (
                                <div key={index} className="group-card__session">
                                    <span className="group-card__session-day">
                                        {getDayName(session.dayOfWeek)}:
                                    </span>
                                    <span className="group-card__session-time">
                                        {session.startTime} - {session.endTime}
                                    </span>
                                    <span className="group-card__session-room">
                                        ({session.classroom})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="group-card__actions">
                {onEnroll && (
                    <button
                        className="group-card__btn group-card__btn--primary"
                        onClick={() => onEnroll(group.id)}
                        disabled={!isAvailable || isEnrolling}
                    >
                        {!canEnroll ? 'No disponible' :
                            isFull ? 'Grupo lleno' :
                                group.status !== 'ACTIVE' ? 'No activo' :
                                    isEnrolling ? 'Inscribiendo...' :
                                        'Inscribirse'}
                    </button>
                )}

                {onViewDetails && (
                    <button
                        className="group-card__btn group-card__btn--secondary"
                        onClick={() => onViewDetails(group)}
                    >
                        Ver Detalles
                    </button>
                )}
            </div>

            {isFull && group.status === 'ACTIVE' && (
                <div className="group-card__alert">
                    <p>Este grupo está lleno.</p>
                    <button
                        className="group-card__request-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/student/group-requests', {
                                state: {
                                    createNew: true,
                                    selectedSubjectId: group.subjectId
                                }
                            });
                        }}
                    >
                        Solicitar nuevo grupo
                    </button>
                </div>
            )}
        </div>
    );
};