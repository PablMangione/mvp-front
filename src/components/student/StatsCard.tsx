// src/components/student/StatsCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StatsCard.css';

interface StatsCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon?: string;
    actionLabel?: string;
    actionPath?: string;
    onClick?: () => void;
}

/**
 * Componente reutilizable para mostrar una estadística.
 * Extrae la estructura repetitiva de las tarjetas del dashboard.
 */
export const StatsCard: React.FC<StatsCardProps> = ({
                                                        title,
                                                        value,
                                                        description,
                                                        icon,
                                                        actionLabel,
                                                        actionPath,
                                                        onClick
                                                    }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (actionPath) {
            navigate(actionPath);
        }
    };

    return (
        <div className="stats-card">
            <h3 className="stats-card__title">{title}</h3>

            <div className="stats-card__value-container">
                {icon && <span className="stats-card__icon">{icon}</span>}
                <p className="stats-card__value">{value}</p>
            </div>

            {description && (
                <p className="stats-card__description">{description}</p>
            )}

            {(actionLabel && (onClick || actionPath)) && (
                <button
                    className="stats-card__action"
                    onClick={handleClick}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};