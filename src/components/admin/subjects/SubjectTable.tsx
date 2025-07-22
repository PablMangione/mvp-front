// src/components/admin/subjects/SubjectTable.tsx
import React from 'react';
import { DataTable, type Column, StatusBadge, ActionButtons } from '../common';
import type { SubjectDto } from '../../../types/admin.types';

interface SubjectTableProps {
    subjects: SubjectDto[];
    loading?: boolean;
    error?: string | null;
    onEdit: (subject: SubjectDto) => void;
    onDelete: (subject: SubjectDto) => void;
    onView: (subject: SubjectDto) => void;
    onManageGroups?: (subject: SubjectDto) => void;
}

/**
 * Tabla específica para mostrar asignaturas en el panel de administración.
 * Define las columnas y acciones específicas para la gestión de asignaturas.
 */
export const SubjectTable: React.FC<SubjectTableProps> = ({
                                                              subjects,
                                                              loading,
                                                              error,
                                                              onEdit,
                                                              onDelete,
                                                              onView,
                                                              onManageGroups
                                                          }) => {
    const columns: Column<SubjectDto>[] = [
        {
            key: 'code',
            label: 'Código',
            width: '100px',
            sortable: true,
            render: (subject) => (
                <span className="font-mono">{subject.code}</span>
            )
        },
        {
            key: 'name',
            label: 'Nombre',
            sortable: true,
            render: (subject) => (
                <div className="subject-name">
                    <strong>{subject.name}</strong>
                    <div className="text-muted small">{subject.major}</div>
                </div>
            )
        },
        {
            key: 'year',
            label: 'Año',
            align: 'center',
            width: '80px',
            sortable: true,
            render: (subject) => (
                <span className="badge badge--info">{subject.year}°</span>
            )
        },
        {
            key: 'credits',
            label: 'Créditos',
            align: 'center',
            width: '100px',
            render: (subject) => (
                <span className="credits-badge">{subject.credits}</span>
            )
        },
        {
            key: 'groupCount',
            label: 'Grupos',
            align: 'center',
            render: (subject) => {
                const count = subject.groupCount || 0;
                return (
                    <span className={`badge ${count > 0 ? 'badge--success' : 'badge--secondary'}`}>
                        {count}
                    </span>
                );
            }
        },
        {
            key: 'active',
            label: 'Estado',
            align: 'center',
            render: (subject) => (
                <StatusBadge
                    status={subject.active ? 'ACTIVA' : 'INACTIVA'}
                    variant={subject.active ? 'success' : 'secondary'}
                />
            )
        }
    ];

    const customActions = onManageGroups ? [
        {
            icon: '👥',
            label: 'Gestionar grupos',
            onClick: (subject: SubjectDto) => onManageGroups(subject),
            variant: 'primary' as const
        }
    ] : [];

    return (
        <DataTable
            columns={columns}
            data={subjects}
            loading={loading}
            error={error}
            keyExtractor={(subject) => subject.id}
            emptyMessage="No hay asignaturas registradas"
            emptyIcon="📚"
            actions={(subject) => (
                <ActionButtons
                    onView={() => onView(subject)}
                    onEdit={() => onEdit(subject)}
                    onDelete={() => onDelete(subject)}
                    customActions={customActions.map(action => ({
                        ...action,
                        onClick: () => action.onClick(subject)
                    }))}
                />
            )}
        />
    );
};