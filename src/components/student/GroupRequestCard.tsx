// src/components/student/GroupRequestCard.tsx
import React from 'react';
import type { GroupRequest } from '../../types/student.types';
import './GroupRequestCard.css';

interface GroupRequestCardProps {
    request: GroupRequest;
    onViewSubject?: (subjectId: number) => void;
    onCancel?: (requestId: number) => void;
    showActions?: boolean;
}

/**
 * Componente reutilizable para mostrar una solicitud de grupo
 * Extrae la lógica de presentación de la página GroupRequests
 */
export const GroupRequestCard: React.FC<GroupRequestCardProps> = ({
                                                                      request,
                                                                      onViewSubject,
                                                                      onCancel,
                                                                      showActions = true
                                                                  }) => {
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    label: 'Pendiente',
                    className: 'pending',
                    icon: '⏳',
                    description: 'Tu solicitud está siendo revisada'
                };
            case 'APPROVED':
                return {
                    label: 'Aprobada',
                    className: 'approved',
                    icon: '✓',
                    description: 'Se creará un nuevo grupo próximamente'
                };
            case 'REJECTED':
                return {
                    label: 'Rechazada',
                    className: 'rejected',
                    icon: '✗',
                    description: 'La solicitud no pudo ser aprobada'
                };
            default:
                return {
                    label: status,
                    className: '',
                    icon: '?',
                    description: ''
                };
        }
    };

    const formatDate = (dateString: string) => {
        // Convertir el formato del backend a ISO 8601
        const isoDate = dateString.replace(' ', 'T');
        const date = new Date(isoDate);

        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        console.log(date)
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Hoy';
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else {
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const statusInfo = getStatusInfo(request.status);

    return (
        <div className={`group-request-card group-request-card--${statusInfo.className}`}>
            <div className="group-request-card__header">
                <div className="group-request-card__title-section">
                    <h4 className="group-request-card__subject">{request.subjectName}</h4>
                    <p className="group-request-card__date">
                        Solicitado {formatDate(request.createdAt)}
                    </p>
                </div>
                <div className={`group-request-card__status ${statusInfo.className}`}>
                    <span className="group-request-card__status-icon">{statusInfo.icon}</span>
                    <span className="group-request-card__status-label">{statusInfo.label}</span>
                </div>
            </div>

            {statusInfo.description && (
                <p className="group-request-card__status-description">
                    {statusInfo.description}
                </p>
            )}

            {request.comments && (
                <div className="group-request-card__section">
                    <h5 className="group-request-card__section-title">Tu comentario:</h5>
                    <p className="group-request-card__comments">{request.comments}</p>
                </div>
            )}

            {request.adminComments && (
                <div className="group-request-card__section group-request-card__admin-section">
                    <h5 className="group-request-card__section-title">
                        <span className="group-request-card__admin-icon">👤</span>
                        Respuesta del administrador:
                    </h5>
                    <p className="group-request-card__admin-comments">{request.adminComments}</p>
                </div>
            )}

            {showActions && (
                <div className="group-request-card__actions">
                    {request.status === 'APPROVED' && onViewSubject && (
                        <button
                            className="group-request-card__btn group-request-card__btn--primary"
                            onClick={() => onViewSubject(request.subjectId)}
                        >
                            Ver Grupos Disponibles
                        </button>
                    )}

                    {request.status === 'PENDING' && onCancel && (
                        <button
                            className="group-request-card__btn group-request-card__btn--danger"
                            onClick={() => onCancel(request.id)}
                        >
                            Cancelar Solicitud
                        </button>
                    )}

                    {request.status === 'PENDING' && (
                        <div className="group-request-card__pending-info">
                            <span className="group-request-card__pending-icon">ℹ️</span>
                            <span>Las solicitudes suelen procesarse en 2-3 días hábiles</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};