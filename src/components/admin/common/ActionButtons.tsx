// src/components/admin/common/ActionButtons.tsx
import React from 'react';
import './ActionButtons.css';

interface ActionButtonsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    customActions?: Array<{
        icon: string;
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
        disabled?: boolean;
    }>;
    size?: 'small' | 'medium';
    direction?: 'horizontal' | 'vertical';
}

/**
 * Conjunto de botones de acción para usar en tablas y listas.
 * Proporciona acciones comunes (ver, editar, eliminar) y acciones personalizadas.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
                                                                onEdit,
                                                                onDelete,
                                                                onView,
                                                                customActions = [],
                                                                size = 'small',
                                                                direction = 'horizontal'
                                                            }) => {
    const buttonClasses = [
        'action-button',
        `action-button--${size}`
    ].join(' ');

    const containerClasses = [
        'action-buttons',
        `action-buttons--${direction}`
    ].join(' ');

    return (
        <div className={containerClasses}>
            {onView && (
                <button
                    className={`${buttonClasses} action-button--info`}
                    onClick={onView}
                    title="Ver detalles"
                    aria-label="Ver detalles"
                >
                    <span aria-hidden="true">👁️</span>
                </button>
            )}

            {onEdit && (
                <button
                    className={`${buttonClasses} action-button--primary`}
                    onClick={onEdit}
                    title="Editar"
                    aria-label="Editar"
                >
                    <span aria-hidden="true">✏️</span>
                </button>
            )}

            {onDelete && (
                <button
                    className={`${buttonClasses} action-button--danger`}
                    onClick={onDelete}
                    title="Eliminar"
                    aria-label="Eliminar"
                >
                    <span aria-hidden="true">🗑️</span>
                </button>
            )}

            {customActions.map((action, index) => (
                <button
                    key={index}
                    className={`${buttonClasses} action-button--${action.variant || 'secondary'}`}
                    onClick={action.onClick}
                    title={action.label}
                    aria-label={action.label}
                    disabled={action.disabled}
                >
                    <span aria-hidden="true">{action.icon}</span>
                </button>
            ))}
        </div>
    );
};