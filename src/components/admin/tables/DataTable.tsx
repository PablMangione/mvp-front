// src/components/admin/tables/DataTable.tsx
import React from 'react';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { EmptyState } from '../../common/EmptyState';
import './DataTable.css';

/**
 * Definición de una columna de la tabla.
 * Cada columna puede tener propiedades de renderizado personalizadas.
 */
export interface TableColumn<T> {
    // Identificador único de la columna
    key: string;

    // Encabezado visible de la columna
    header: string;

    // Función para obtener el valor a mostrar
    // Si no se proporciona, se usa el valor directo del objeto
    accessor?: (item: T) => React.ReactNode;

    // ¿Es ordenable esta columna?
    sortable?: boolean;

    // Campo real en la BD para ordenamiento (si difiere de key)
    sortField?: string;

    // Ancho de la columna (CSS válido: px, %, etc.)
    width?: string;

    // Alineación del contenido
    align?: 'left' | 'center' | 'right';

    // Clase CSS adicional para la columna
    className?: string;
}

/**
 * Definición de una acción que se puede realizar sobre una fila.
 * Las acciones aparecen como botones en la última columna.
 */
export interface TableAction<T> {
    // Etiqueta del botón
    label: string;

    // Icono (emoji o componente)
    icon?: React.ReactNode;

    // Función a ejecutar al hacer clic
    onClick: (item: T) => void;

    // Función para determinar si la acción está disponible
    // Si no se proporciona, siempre está disponible
    isEnabled?: (item: T) => boolean;

    // Función para determinar si mostrar la acción
    // Si no se proporciona, siempre se muestra
    isVisible?: (item: T) => boolean;

    // Estilo visual del botón
    variant?: 'primary' | 'secondary' | 'danger' | 'success';

    // ¿Requiere confirmación antes de ejecutar?
    requireConfirmation?: boolean;
    confirmMessage?: string;
}

/**
 * Props del componente DataTable.
 * Diseñado para ser genérico y trabajar con cualquier tipo de datos.
 */
export interface DataTableProps<T> {
    // Datos a mostrar
    data: T[];

    // Definición de columnas
    columns: TableColumn<T>[];

    // Acciones disponibles por fila
    actions?: TableAction<T>[];

    // Estado de carga
    loading?: boolean;

    // Función para obtener una key única por fila
    keyExtractor: (item: T) => string | number;

    // Ordenamiento actual
    currentSort?: {
        field: string;
        direction: 'asc' | 'desc';
    };

    // Callback cuando se cambia el ordenamiento
    onSort?: (field: string, direction: 'asc' | 'desc') => void;

    // Mensaje cuando no hay datos
    emptyMessage?: string;

    // Acción principal cuando no hay datos
    emptyAction?: {
        label: string;
        onClick: () => void;
    };

    // Título de la tabla (opcional)
    title?: string;

    // ¿Mostrar índice de fila?
    showIndex?: boolean;

    // Clase CSS adicional para la tabla
    className?: string;

    // ¿La fila es seleccionable?
    onRowClick?: (item: T) => void;

    // Estado de eliminación (ID del item siendo eliminado)
    deletingId?: number | string | null;
}

/**
 * Componente DataTable genérico.
 *
 * Este componente proporciona una tabla de datos completa con:
 * - Renderizado flexible de columnas
 * - Ordenamiento por columnas
 * - Acciones por fila con confirmación opcional
 * - Estados de carga y vacío
 * - Diseño responsive
 *
 * El componente está diseñado para ser altamente reutilizable,
 * permitiendo personalizar casi todos los aspectos de la tabla
 * mientras mantiene una apariencia consistente.
*/
export function DataTable<T extends Record<string, any>>({
                                                             data,
                                                             columns,
                                                             actions = [],
                                                             loading = false,
                                                             keyExtractor,
                                                             currentSort,
                                                             onSort,
                                                             emptyMessage = 'No hay datos para mostrar',
                                                             emptyAction,
                                                             title,
                                                             showIndex = false,
                                                             className = '',
                                                             onRowClick,
                                                             deletingId
                                                         }: DataTableProps<T>) {
    /**
     * Maneja el click en un encabezado ordenable.
     * Alterna entre ascendente y descendente.
     */
    const handleSort = (column: TableColumn<T>) => {
        if (!column.sortable || !onSort) return;

        const field = column.sortField || column.key;
        const currentDirection = currentSort?.field === field ? currentSort.direction : null;
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

        onSort(field, newDirection);
    };

    /**
     * Renderiza el indicador de ordenamiento en el encabezado.
     */
    const renderSortIndicator = (column: TableColumn<T>) => {
        if (!column.sortable) return null;

        const field = column.sortField || column.key;
        const isActive = currentSort?.field === field;

        return (
            <span className="data-table__sort-indicator">
                <span className={`sort-arrow ${isActive && currentSort.direction === 'asc' ? 'active' : ''}`}>
                    ▲
                </span>
                <span className={`sort-arrow ${isActive && currentSort.direction === 'desc' ? 'active' : ''}`}>
                    ▼
                </span>
            </span>
        );
    };

    /**
     * Ejecuta una acción con confirmación opcional.
     */
    const executeAction = (action: TableAction<T>, item: T) => {
        if (action.requireConfirmation) {
            const message = action.confirmMessage || `¿Está seguro de realizar esta acción?`;
            if (!window.confirm(message)) {
                return;
            }
        }

        action.onClick(item);
    };

    /**
     * Obtiene el valor de una celda.
     * Usa el accessor si está definido, si no accede directamente al objeto.
     */
    const getCellValue = (item: T, column: TableColumn<T>) => {
        if (column.accessor) {
            return column.accessor(item);
        }

        // Acceso directo al valor usando la key
        // Soporta paths anidados como "user.name"
        const keys = column.key.split('.');
        let value: any = item;

        for (const key of keys) {
            value = value?.[key];
        }

        return value ?? '-';
    };

    /**
     * Renderiza el estado de carga.
     */
    if (loading && data.length === 0) {
        return (
            <div className={`data-table-container ${className}`}>
                <LoadingSpinner size="large" message="Cargando datos..." />
            </div>
        );
    }

    /**
     * Renderiza el estado vacío.
     */
    if (!loading && data.length === 0) {
        return (
            <div className={`data-table-container ${className}`}>
                <EmptyState
                    icon="📋"
                    title="No hay datos"
                    message={emptyMessage}
                    action={emptyAction}
                />
            </div>
        );
    }

    /**
     * Renderiza la tabla completa.
     */
    return (
        <div className={`data-table-container ${className}`}>
            {title && <h3 className="data-table__title">{title}</h3>}

            <div className="data-table__wrapper">
                <table className="data-table">
                    <thead className="data-table__header">
                    <tr>
                        {showIndex && (
                            <th className="data-table__header-cell data-table__index-cell">
                                #
                            </th>
                        )}

                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`
                                        data-table__header-cell 
                                        ${column.sortable ? 'sortable' : ''} 
                                        ${column.className || ''}
                                    `}
                                style={{
                                    width: column.width,
                                    textAlign: column.align || 'left'
                                }}
                                onClick={() => column.sortable && handleSort(column)}
                            >
                                <div className="data-table__header-content">
                                    <span>{column.header}</span>
                                    {renderSortIndicator(column)}
                                </div>
                            </th>
                        ))}

                        {actions.length > 0 && (
                            <th className="data-table__header-cell data-table__actions-cell">
                                Acciones
                            </th>
                        )}
                    </tr>
                    </thead>

                    <tbody className="data-table__body">
                    {data.map((item, index) => {
                        const key = keyExtractor(item);
                        const isDeleting = deletingId === key;

                        return (
                            <tr
                                key={key}
                                className={`
                                        data-table__row 
                                        ${onRowClick ? 'clickable' : ''}
                                        ${isDeleting ? 'deleting' : ''}
                                    `}
                                onClick={() => onRowClick && onRowClick(item)}
                            >
                                {showIndex && (
                                    <td className="data-table__cell data-table__index-cell">
                                        {index + 1}
                                    </td>
                                )}

                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`data-table__cell ${column.className || ''}`}
                                        style={{ textAlign: column.align || 'left' }}
                                    >
                                        {getCellValue(item, column)}
                                    </td>
                                ))}

                                {actions.length > 0 && (
                                    <td className="data-table__cell data-table__actions-cell">
                                        <div className="data-table__actions">
                                            {actions
                                                .filter(action => !action.isVisible || action.isVisible(item))
                                                .map((action, actionIndex) => {
                                                    const isEnabled = !action.isEnabled || action.isEnabled(item);

                                                    return (
                                                        <button
                                                            key={actionIndex}
                                                            className={`
                                                                    data-table__action-btn 
                                                                    data-table__action-btn--${action.variant || 'secondary'}
                                                                    ${!isEnabled ? 'disabled' : ''}
                                                                `}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isEnabled && !isDeleting) {
                                                                    executeAction(action, item);
                                                                }
                                                            }}
                                                            disabled={!isEnabled || isDeleting}
                                                            title={action.label}
                                                        >
                                                            {isDeleting && action.variant === 'danger' ? (
                                                                <span className="data-table__action-loading">⏳</span>
                                                            ) : (
                                                                <>
                                                                    {action.icon && <span>{action.icon}</span>}
                                                                    <span className="data-table__action-label">
                                                                            {action.label}
                                                                        </span>
                                                                </>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {/* Overlay de carga para actualizaciones */}
                {loading && data.length > 0 && (
                    <div className="data-table__loading-overlay">
                        <LoadingSpinner size="medium" />
                    </div>
                )}
            </div>
        </div>
    );
}