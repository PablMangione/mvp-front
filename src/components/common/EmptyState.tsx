// src/components/common/EmptyState.tsx
import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
    icon?: string;
    title: string;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * Componente para mostrar estados vacíos.
 * Usado cuando no hay datos para mostrar: listas vacías, búsquedas sin resultados,
 * primera vez que se accede a una sección, etc.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
                                                          icon = '📋',
                                                          title,
                                                          message,
                                                          action,
                                                          className = ''
                                                      }) => {
    return (
        <div className={`empty-state ${className}`}>
            <div className="empty-state__content">
                <div className="empty-state__icon" role="img" aria-label="Empty state icon">
                    {icon}
                </div>
                <h3 className="empty-state__title">{title}</h3>
                <p className="empty-state__message">{message}</p>
                {action && (
                    <button
                        className="empty-state__action"
                        onClick={action.onClick}
                        type="button"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};