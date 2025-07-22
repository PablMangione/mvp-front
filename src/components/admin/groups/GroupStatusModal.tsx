// src/components/admin/groups/GroupStatusModal.tsx
import React, { useState } from 'react';
import { FormModal, StatusBadge } from '../common';
import type { CourseGroupDto, UpdateGroupStatusDto } from '../../../types/admin.types';

interface GroupStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UpdateGroupStatusDto) => Promise<void>;
    group: CourseGroupDto | null;
    loading?: boolean;
}

/**
 * Modal para cambiar el estado de un grupo.
 * Maneja las transiciones de estado según las reglas de negocio.
 */
export const GroupStatusModal: React.FC<GroupStatusModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      onSubmit,
                                                                      group,
                                                                      loading
                                                                  }) => {
    const [formData, setFormData] = useState<UpdateGroupStatusDto>({
        status: 'ACTIVO',
        reason: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof UpdateGroupStatusDto, string>>>({});

    // Determinar estados permitidos según el estado actual
    const getAllowedStatuses = () => {
        if (!group) return [];

        switch (group.status) {
            case 'PLANIFICADO':
                return ['ACTIVO', 'CERRADO'];
            case 'ACTIVO':
                return ['CERRADO'];
            case 'CERRADO':
                return []; // No se puede cambiar desde cerrado
            default:
                return [];
        }
    };

    const allowedStatuses = getAllowedStatuses();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof UpdateGroupStatusDto]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof UpdateGroupStatusDto, string>> = {};

        if (!formData.status) {
            newErrors.status = 'Debe seleccionar un estado';
        }

        // Requerir razón para ciertos cambios
        if (formData.status === 'CERRADO' && !formData.reason?.trim()) {
            newErrors.reason = 'Debe proporcionar una razón para cerrar el grupo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    if (!group) return null;

    return (
        <FormModal
            isOpen={isOpen}
            title={`Cambiar Estado del Grupo ${group.groupNumber}`}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Cambiar Estado"
            size="small"
        >
            <div className="form-group">
                <label>Estado Actual</label>
                <div className="mb-3">
                    <StatusBadge status={group.status} />
                </div>
            </div>

            {allowedStatuses.length > 0 ? (
                <>
                    <div className="form-group">
                        <label htmlFor="status">Nuevo Estado *</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="">Seleccionar...</option>
                            {allowedStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                        {errors.status && <span className="form-error">{errors.status}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">
                            Razón del cambio {formData.status === 'CERRADO' && '*'}
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Explique la razón del cambio de estado..."
                            disabled={loading}
                        />
                        {errors.reason && <span className="form-error">{errors.reason}</span>}
                    </div>

                    <div className="form-info">
                        <small>
                            <strong>Información importante:</strong><br />
                            • PLANIFICADO → ACTIVO: El grupo comenzará a impartirse<br />
                            • ACTIVO → CERRADO: No se permitirán más inscripciones<br />
                            • Los cambios de estado son irreversibles
                        </small>
                    </div>
                </>
            ) : (
                <div className="alert alert-info">
                    Un grupo en estado CERRADO no puede cambiar de estado.
                </div>
            )}
        </FormModal>
    );
};