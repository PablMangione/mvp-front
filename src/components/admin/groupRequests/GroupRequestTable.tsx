// src/components/admin/requests/GroupRequestTable.tsx
import React from 'react';
import { DataTable, type Column, StatusBadge, ActionButtons } from '../common';
import type { GroupRequestDto } from '../../../types/admin.types';

interface GroupRequestTableProps {
    requests: GroupRequestDto[];
    loading?: boolean;
    error?: string | null;
    onView: (request: GroupRequestDto) => void;
    onApprove: (request: GroupRequestDto) => void;
    onReject: (request: GroupRequestDto) => void;
}

/**
 * Tabla específica para mostrar solicitudes de grupo en el panel de administración.
 * Permite gestionar aprobaciones y rechazos de solicitudes.
 */
export const GroupRequestTable: React.FC<GroupRequestTableProps> = ({
                                                                        requests,
                                                                        loading,
                                                                        error,
                                                                        onView,
                                                                        onApprove,
                                                                        onReject
                                                                    }) => {
    const columns: Column<GroupRequestDto>[] = [
        {
            key: 'id',
            label: 'ID',
            width: '60px',
            sortable: true
        },
        {
            key: 'student',
            label: 'Estudiante',
            render: (request) => (
                <div className="student-info">
                    <strong>{request.student.name}</strong>
                    <div className="text-muted small">{request.student.email}</div>
                    <div className="text-muted small">{request.student.major}</div>
                </div>
            )
        },
        {
            key: 'subject',
            label: 'Asignatura',
            render: (request) => (
                <div className="subject-info">
                    <strong>{request.subject.name}</strong>
                    <div className="text-muted small">
                        {request.subject.code} - Año {request.subject.year}
                    </div>
                </div>
            )
        },
        {
            key: 'reason',
            label: 'Motivo',
            render: (request) => (
                <div className="reason-text" title={request.reason}>
                    {request.reason.length > 100
                        ? `${request.reason.substring(0, 100)}...`
                        : request.reason}
                </div>
            )
        },
        {
            key: 'preferredSchedule',
            label: 'Horario Preferido',
            render: (request) => (
                <span className="text-small">{request.preferredSchedule || 'Sin preferencia'}</span>
            )
        },
        {
            key: 'createdAt',
            label: 'Fecha Solicitud',
            sortable: true,
            render: (request) => (
                <div>
                    {new Date(request.createdAt).toLocaleDateString('es-ES')}
                    <div className="text-muted small">
                        {new Date(request.createdAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Estado',
            align: 'center',
            render: (request) => (
                <StatusBadge status={request.status} />
            )
        }
    ];

    // Acciones personalizadas según el estado
    const getCustomActions = (request: GroupRequestDto) => {
        const actions: any[] = [];

        if (request.status === 'PENDIENTE') {
            actions.push({
                icon: '✅',
                label: 'Aprobar',
                onClick: () => onApprove(request),
                variant: 'success' as const
            });
            actions.push({
                icon: '❌',
                label: 'Rechazar',
                onClick: () => onReject(request),
                variant: 'danger' as const
            });
        }

        return actions;
    };

    return (
        <DataTable
            columns={columns}
            data={requests}
            loading={loading}
            error={error}
            keyExtractor={(request) => request.id}
            emptyMessage="No hay solicitudes de grupo"
            emptyIcon="📝"
            hoverable
            actions={(request) => (
                <ActionButtons
                    onView={() => onView(request)}
                    customActions={getCustomActions(request)}
                />
            )}
        />
    );
};