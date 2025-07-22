// src/components/common/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
    fullScreen?: boolean;
    overlay?: boolean;
    className?: string;
}

/**
 * Indicador de carga configurable.
 * Usado para mostrar estado de carga en peticiones asíncronas,
 * puede ser inline, con overlay o pantalla completa.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                                  size = 'medium',
                                                                  message,
                                                                  fullScreen = false,
                                                                  overlay = false,
                                                                  className = ''
                                                              }) => {
    const spinnerElement = (
        <div className={`loading-spinner__container ${className}`}>
            <div className={`loading-spinner loading-spinner--${size}`}>
                <div className="loading-spinner__circle"></div>
                <div className="loading-spinner__circle"></div>
                <div className="loading-spinner__circle"></div>
                <div className="loading-spinner__circle"></div>
            </div>
            {message && (
                <p className="loading-spinner__message">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="loading-spinner__fullscreen">
                {spinnerElement}
            </div>
        );
    }

    if (overlay) {
        return (
            <div className="loading-spinner__overlay">
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
};