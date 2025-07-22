// src/components/admin/students/StudentTable.tsx
import React from 'react';
import { DataTable, type Column, StatusBadge, ActionButtons } from '../common';
import type { StudentDto } from '../../../types/admin.types';

interface StudentTableProps {
    students: StudentDto[];
    loading?: boolean;
    error?: string | null;
    onEdit: (student: StudentDto) => void;
    onDelete: (student: StudentDto) => void;
    onView: (student: StudentDto) => void;
}

/**
 * Tabla específica para mostrar estudiantes en el panel de administración.
 * Define las columnas y acciones específicas para la gestión de estudiantes.
 */
export const StudentTable: React.FC<StudentTableProps> = ({
                                                              students,
                                                              loading,
                                                              error,
                                                              onEdit,
                                                              onDelete,
                                                              onView
                                                          }) => {
    const columns: Column<StudentDto>[] = [
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
            render: (student) => (
                <div className="student-name">
                    <strong>{student.name}</strong>
                    <div className="text-muted small">{student.email}</div>
                </div>
            )
        },
        {
            key: 'major',
            label: 'Carrera',
            sortable: true
        },
        {
            key: 'enrollmentCount',
            label: 'Inscripciones',
            align: 'center',
            render: (student) => (
                <span className="badge">{student.enrollmentCount || 0}</span>
            )
        },
        {
            key: 'active',
            label: 'Estado',
            align: 'center',
            render: (student) => (
                <StatusBadge
                    status={student.active ? 'ACTIVO' : 'INACTIVO'}
                    variant={student.active ? 'success' : 'secondary'}
                />
            )
        },
        {
            key: 'createdAt',
            label: 'Fecha Registro',
            sortable: true,
            render: (student) => new Date(student.createdAt).toLocaleDateString('es-ES')
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={students}
            loading={loading}
            error={error}
            keyExtractor={(student) => student.id}
            emptyMessage="No hay estudiantes registrados"
            emptyIcon="🎓"
            actions={(student) => (
                <ActionButtons
                    onView={() => onView(student)}
                    onEdit={() => onEdit(student)}
                    onDelete={() => onDelete(student)}
                />
            )}
        />
    );
};