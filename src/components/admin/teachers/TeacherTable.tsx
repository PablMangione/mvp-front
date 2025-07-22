// src/components/admin/teachers/TeacherTable.tsx
import React from 'react';
import { DataTable, type Column, StatusBadge, ActionButtons } from '../common';
import type { TeacherDto } from '../../../types/admin.types';

interface TeacherTableProps {
    teachers: TeacherDto[];
    loading?: boolean;
    error?: string | null;
    onEdit: (teacher: TeacherDto) => void;
    onDelete: (teacher: TeacherDto) => void;
    onView: (teacher: TeacherDto) => void;
    onViewSchedule?: (teacher: TeacherDto) => void;
}

/**
 * Tabla específica para mostrar profesores en el panel de administración.
 * Define las columnas y acciones específicas para la gestión de profesores.
 */
export const TeacherTable: React.FC<TeacherTableProps> = ({
                                                              teachers,
                                                              loading,
                                                              error,
                                                              onEdit,
                                                              onDelete,
                                                              onView,
                                                              onViewSchedule
                                                          }) => {
    const columns: Column<TeacherDto>[] = [
        {
            key: 'id',
            label: 'ID',
            width: '80px',
            sortable: true
        },
        {
            key: 'name',
            label: 'Nombre',
            sortable: true,
            render: (teacher) => (
                <div className="teacher-name">
                    <strong>{teacher.name}</strong>
                    <div className="text-muted small">{teacher.email}</div>
                </div>
            )
        },
        {
            key: 'groupCount',
            label: 'Grupos Asignados',
            align: 'center',
            render: (teacher) => {
                const count = teacher.groupCount || 0;
                return (
                    <span className={`badge ${count > 0 ? 'badge--primary' : 'badge--secondary'}`}>
                        {count}
                    </span>
                );
            }
        },
        {
            key: 'active',
            label: 'Estado',
            align: 'center',
            render: (teacher) => (
                <StatusBadge
                    status={teacher.active ? 'ACTIVO' : 'INACTIVO'}
                    variant={teacher.active ? 'success' : 'secondary'}
                />
            )
        },
        {
            key: 'createdAt',
            label: 'Fecha Registro',
            sortable: true,
            render: (teacher) => new Date(teacher.createdAt).toLocaleDateString('es-ES')
        }
    ];

    const customActions = onViewSchedule ? [
        {
            icon: '📅',
            label: 'Ver horario',
            onClick: (teacher: TeacherDto) => onViewSchedule(teacher),
            variant: 'info' as const
        }
    ] : [];

    return (
        <DataTable
            columns={columns}
            data={teachers}
            loading={loading}
            error={error}
            keyExtractor={(teacher) => teacher.id}
            emptyMessage="No hay profesores registrados"
            emptyIcon="👨‍🏫"
            actions={(teacher) => (
                <ActionButtons
                    onView={() => onView(teacher)}
                    onEdit={() => onEdit(teacher)}
                    onDelete={() => onDelete(teacher)}
                    customActions={customActions.map(action => ({
                        ...action,
                        onClick: () => action.onClick(teacher)
                    }))}
                />
            )}
        />
    );
};