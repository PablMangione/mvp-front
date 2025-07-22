// src/components/admin/groups/GroupTable.tsx
import React from 'react';
import { DataTable, type Column, StatusBadge, ActionButtons } from '../common';
import type { CourseGroupDto } from '../../../types/admin.types';

interface GroupTableProps {
    groups: CourseGroupDto[];
    loading?: boolean;
    error?: string | null;
    onEdit: (group: CourseGroupDto) => void;
    onDelete: (group: CourseGroupDto) => void;
    onView: (group: CourseGroupDto) => void;
    onChangeStatus: (group: CourseGroupDto) => void;
    onViewStudents?: (group: CourseGroupDto) => void;
}

/**
 * Tabla específica para mostrar grupos en el panel de administración.
 * Define las columnas y acciones específicas para la gestión de grupos.
 */
export const GroupTable: React.FC<GroupTableProps> = ({
                                                          groups,
                                                          loading,
                                                          error,
                                                          onEdit,
                                                          onDelete,
                                                          onView,
                                                          onChangeStatus,
                                                          onViewStudents
                                                      }) => {
    const formatSchedule = (schedule: CourseGroupDto['schedule']) => {
        if (!schedule || schedule.length === 0) return 'Sin horario';

        const days = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        return schedule.map(s =>
            `${days[s.dayOfWeek]} ${s.startTime}-${s.endTime}`
        ).join(', ');
    };

    const columns: Column<CourseGroupDto>[] = [
        {
            key: 'groupNumber',
            label: 'Grupo',
            width: '80px',
            align: 'center',
            sortable: true,
            render: (group) => (
                <span className="font-mono font-bold">G{group.groupNumber}</span>
            )
        },
        {
            key: 'subject',
            label: 'Asignatura',
            sortable: true,
            render: (group) => (
                <div className="group-subject">
                    <strong>{group.subject.name}</strong>
                    <div className="text-muted small">
                        {group.subject.code} - {group.subject.major}
                    </div>
                </div>
            )
        },
        {
            key: 'teacher',
            label: 'Profesor',
            render: (group) => group.teacher ? (
                <div>
                    {group.teacher.name}
                    <div className="text-muted small">{group.teacher.email}</div>
                </div>
            ) : (
                <span className="text-muted">Sin asignar</span>
            )
        },
        {
            key: 'schedule',
            label: 'Horario',
            render: (group) => (
                <span className="text-small">{formatSchedule(group.schedule)}</span>
            )
        },
        {
            key: 'capacity',
            label: 'Ocupación',
            align: 'center',
            render: (group) => {
                const percentage = group.capacity > 0
                    ? Math.round((group.enrolled / group.capacity) * 100)
                    : 0;
                const isFull = group.enrolled >= group.capacity;

                return (
                    <div className="capacity-info">
                        <span className={`capacity-badge ${isFull ? 'capacity-badge--full' : ''}`}>
                            {group.enrolled}/{group.capacity}
                        </span>
                        <div className="capacity-bar">
                            <div
                                className="capacity-bar__fill"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <span className="text-muted small">{percentage}%</span>
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Estado',
            align: 'center',
            render: (group) => (
                <StatusBadge status={group.status} />
            )
        }
    ];

    const customActions: Array<{
        icon: string;
        label: string;
        onClick: (group: CourseGroupDto) => void;
        variant: 'primary' | 'success' | 'warning' | 'danger' | 'info';
        disabled?: (group: CourseGroupDto) => boolean;
    }> = [
        {
            icon: '🔄',
            label: 'Cambiar estado',
            onClick: onChangeStatus,
            variant: 'warning'
        }
    ];

    if (onViewStudents) {
        customActions.push({
            icon: '👥',
            label: 'Ver estudiantes',
            onClick: onViewStudents,
            variant: 'info'
        });
    }

    return (
        <DataTable
            columns={columns}
            data={groups}
            loading={loading}
            error={error}
            keyExtractor={(group) => group.id}
            emptyMessage="No hay grupos registrados"
            emptyIcon="👥"
            actions={(group) => (
                <ActionButtons
                    onView={() => onView(group)}
                    onEdit={() => onEdit(group)}
                    onDelete={() => onDelete(group)}
                    customActions={customActions.map(action => ({
                        ...action,
                        onClick: () => action.onClick(group),
                        disabled: action.disabled?.(group)
                    }))}
                />
            )}
        />
    );
};