// src/components/admin/common/StatusBadge.tsx
import React from 'react';
import './StatusBadge.css';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

interface StatusBadgeProps {
    status: string;
    variant?: BadgeVariant;
    icon?: string;
    className?: string;
}

// Mapeo de estados a variantes predefinidas
const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
    // Estados de grupo
    'PLANIFICADO': 'info',
    'ACTIVO': 'success',
    'CERRADO': 'secondary',

    // Estados de solicitud
    'PENDIENTE': 'warning',
    'APROBADA': 'success',
    'RECHAZADA': 'danger',

    // Estados de pago
    'PAGADO': 'success',
    'VENCIDO': 'danger',

    // Estados generales
    'ENABLED': 'success',
    'DISABLED': 'secondary',
    'true': 'success',
    'false': 'danger'
};

// Mapeo de estados a iconos predefinidos
const STATUS_ICON_MAP: Record<string, string> = {
    'PLANIFICADO': '📅',
    'ACTIVO': '✅',
    'CERRADO': '🔒',
    'PENDIENTE': '⏳',
    'APROBADA': '✓',
    'RECHAZADA': '✗',
    'PAGADO': '💰',
    'VENCIDO': '⚠️',
    'ENABLED': '✓',
    'DISABLED': '✗',
    'true': '✓',
    'false': '✗'
};

/**
 * Badge para mostrar estados de forma visual en el panel de administración.
 * Automáticamente asigna colores e iconos según el estado.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
                                                            status,
                                                            variant,
                                                            icon,
                                                            className = ''
                                                        }) => {
    // Determinar variante automáticamente si no se proporciona
    const badgeVariant = variant || STATUS_VARIANT_MAP[status] || 'secondary';

    // Determinar icono automáticamente si no se proporciona
    const badgeIcon = icon || STATUS_ICON_MAP[status];

    const badgeClasses = [
        'status-badge',
        `status-badge--${badgeVariant}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={badgeClasses}>
            {badgeIcon && (
                <span className="status-badge__icon" aria-hidden="true">
                    {badgeIcon}
                </span>
            )}
            <span className="status-badge__text">
                {status}
            </span>
        </span>
    );
};