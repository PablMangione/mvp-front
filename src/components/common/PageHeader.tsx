// src/components/common/PageHeader.tsx
import React from 'react';
import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumb?: Array<{
        label: string;
        path?: string;
        onClick?: () => void;
    }>;
}

/**
 * Componente común para encabezados de página.
 * Usado en todas las vistas principales de los diferentes roles.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
                                                          title,
                                                          subtitle,
                                                          actions,
                                                          breadcrumb
                                                      }) => {
    return (
        <div className="page-header">
            {breadcrumb && breadcrumb.length > 0 && (
                <nav className="page-header__breadcrumb" aria-label="Breadcrumb">
                    {breadcrumb.map((item, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="page-header__separator">/</span>}
                            {item.path || item.onClick ? (
                                <a
                                    href={item.path}
                                    onClick={(e) => {
                                        if (item.onClick) {
                                            e.preventDefault();
                                            item.onClick();
                                        }
                                    }}
                                    className="page-header__breadcrumb-link"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <span className="page-header__breadcrumb-current">
                                    {item.label}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            <div className="page-header__content">
                <div className="page-header__text">
                    <h1 className="page-header__title">{title}</h1>
                    {subtitle && (
                        <p className="page-header__subtitle">{subtitle}</p>
                    )}
                </div>

                {actions && (
                    <div className="page-header__actions">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};