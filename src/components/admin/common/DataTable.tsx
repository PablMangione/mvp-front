// src/components/admin/common/DataTable.tsx
import React from 'react';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { EmptyState } from '../../common/EmptyState';
import './DataTable.css';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    error?: string | null;
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    emptyMessage?: string;
    emptyIcon?: string;
    className?: string;
    striped?: boolean;
    hoverable?: boolean;
    compact?: boolean;
    keyExtractor: (item: T) => string | number;
}

/**
 * Tabla de datos genérica y reutilizable para el panel de administración.
 * Soporta columnas personalizadas, acciones, estados de carga y vacío.
 */
export const DataTable = <T extends Record<string, any>>({
                                                             columns,
                                                             data,
                                                             loading = false,
                                                             error = null,
                                                             onRowClick,
                                                             actions,
                                                             emptyMessage = 'No hay datos para mostrar',
                                                             emptyIcon = '📋',
                                                             className = '',
                                                             striped = true,
                                                             hoverable = true,
                                                             compact = false,
                                                             keyExtractor
                                                         }: DataTableProps<T>) => {
    const tableClasses = [
        'data-table',
        striped && 'data-table--striped',
        hoverable && 'data-table--hoverable',
        compact && 'data-table--compact',
        className
    ].filter(Boolean).join(' ');

    if (loading) {
        return (
            <div className="data-table__loading">
                <LoadingSpinner message="Cargando datos..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="data-table__error">
                <EmptyState
                    icon="❌"
                    title="Error al cargar datos"
                    message={error}
                />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <EmptyState
                icon={emptyIcon}
                title="Sin datos"
                message={emptyMessage}
            />
        );
    }

    return (
        <div className="data-table__container">
            <table className={tableClasses}>
                <thead className="data-table__header">
                <tr>
                    {columns.map((column, index) => (
                        <th
                            key={index}
                            className={`data-table__header-cell data-table__header-cell--${column.align || 'left'}`}
                            style={{ width: column.width }}
                        >
                            {column.sortable ? (
                                <button className="data-table__sort-button">
                                    {column.label}
                                    <span className="data-table__sort-icon">↕</span>
                                </button>
                            ) : (
                                column.label
                            )}
                        </th>
                    ))}
                    {actions && (
                        <th className="data-table__header-cell data-table__header-cell--center">
                            Acciones
                        </th>
                    )}
                </tr>
                </thead>
                <tbody className="data-table__body">
                {data.map((item) => {
                    const key = keyExtractor(item);
                    return (
                        <tr
                            key={key}
                            className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                            onClick={() => onRowClick && onRowClick(item)}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`data-table__cell data-table__cell--${column.align || 'left'}`}
                                >
                                    {column.render
                                        ? column.render(item)
                                        : item[column.key as keyof T]
                                    }
                                </td>
                            ))}
                            {actions && (
                                <td
                                    className="data-table__cell data-table__cell--actions"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {actions(item)}
                                </td>
                            )}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};