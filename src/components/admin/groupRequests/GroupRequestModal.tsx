// src/components/admin/requests/GroupRequestModal.tsx
import React, { useState } from 'react';
import { FormModal, StatusBadge } from '../common';
import type { GroupRequestDto } from '../../../types/admin.types';

interface GroupRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (comment?: string) => Promise<void>;
    onReject: (reason: string) => Promise<void>;
    request: GroupRequestDto | null;
    loading?: boolean;
}

/**
 * Modal para aprobar o rechazar solicitudes de grupo.
 * Muestra detalles completos de la solicitud y permite agregar comentarios.
 */
export const GroupRequestModal: React.FC<GroupRequestModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        onApprove,
                                                                        onReject,
                                                                        request,
                                                                        loading
                                                                    }) => {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleActionSelect = (selectedAction: 'approve' | 'reject') => {
        setAction(selectedAction);
        setComment('');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (action === 'reject' && !comment.trim()) {
            setError('Debe proporcionar una razón para rechazar la solicitud');
            return;
        }

        try {
            if (action === 'approve') {
                await onApprove(comment.trim() || undefined);
            } else if (action === 'reject') {
                await onReject(comment.trim());
            }
            onClose();
        } catch (error) {
            console.error('Error al procesar solicitud:', error);
        }
    };

    if (!request) return null;

    const isProcessed = request.status !== 'PENDIENTE';

    return (
        <FormModal
            isOpen={isOpen}
            title={`Solicitud de Grupo #${request.id}`}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            submitText={
                action === 'approve' ? 'Aprobar' :
                    action === 'reject' ? 'Rechazar' :
                        'Seleccione una acción'
            }
            size="medium"
        >
            {/* Información de la solicitud */}
            <div className="request-details">
                <div className="detail-section">
                    <h4>Estado Actual</h4>
                    <StatusBadge status={request.status} />
                    {request.processedAt && (
                        <p className="text-muted small mt-1">
                            Procesada el {new Date(request.processedAt).toLocaleString('es-ES')}
                        </p>
                    )}
                </div>

                <div className="detail-section">
                    <h4>Estudiante</h4>
                    <p>
                        <strong>{request.student.name}</strong><br />
                        {request.student.email}<br />
                        {request.student.major}
                    </p>
                </div>

                <div className="detail-section">
                    <h4>Asignatura Solicitada</h4>
                    <p>
                        <strong>{request.subject.name}</strong><br />
                        Código: {request.subject.code}<br />
                        Año: {request.subject.year} - Créditos: {request.subject.credits}
                    </p>
                </div>

                <div className="detail-section">
                    <h4>Motivo de la Solicitud</h4>
                    <p className="reason-full">{request.reason}</p>
                </div>

                <div className="detail-section">
                    <h4>Horario Preferido</h4>
                    <p>{request.preferredSchedule || 'Sin preferencia específica'}</p>
                </div>

                <div className="detail-section">
                    <h4>Fecha de Solicitud</h4>
                    <p>{new Date(request.createdAt).toLocaleString('es-ES')}</p>
                </div>

                {request.adminComment && (
                    <div className="detail-section">
                        <h4>Comentario del Administrador</h4>
                        <p className="admin-comment">{request.adminComment}</p>
                    </div>
                )}
            </div>

            {/* Acciones disponibles solo si está pendiente */}
            {!isProcessed && (
                <>
                    <hr className="my-3" />

                    <div className="action-buttons">
                        <button
                            type="button"
                            className={`action-select-btn ${action === 'approve' ? 'active' : ''}`}
                            onClick={() => handleActionSelect('approve')}
                            disabled={loading}
                        >
                            ✅ Aprobar Solicitud
                        </button>
                        <button
                            type="button"
                            className={`action-select-btn ${action === 'reject' ? 'active' : ''}`}
                            onClick={() => handleActionSelect('reject')}
                            disabled={loading}
                        >
                            ❌ Rechazar Solicitud
                        </button>
                    </div>

                    {action && (
                        <div className="form-group mt-3">
                            <label htmlFor="comment">
                                {action === 'approve'
                                    ? 'Comentario (opcional)'
                                    : 'Razón del rechazo *'}
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value);
                                    setError('');
                                }}
                                rows={4}
                                placeholder={
                                    action === 'approve'
                                        ? 'Agregue un comentario si lo desea...'
                                        : 'Explique la razón del rechazo...'
                                }
                                disabled={loading}
                            />
                            {error && <span className="form-error">{error}</span>}
                        </div>
                    )}

                    <div className="form-info mt-3">
                        <small>
                            <strong>Información importante:</strong><br />
                            • Al aprobar, se creará un nuevo grupo si no existe uno disponible<br />
                            • Al rechazar, el estudiante será notificado con la razón<br />
                            • Esta acción no se puede deshacer
                        </small>
                    </div>
                </>
            )}
        </FormModal>
    );
};