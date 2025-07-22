// src/components/common/ConfirmDialog.tsx
import React from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

/**
 * Modal de confirmación reutilizable.
 * Usado para confirmar acciones críticas como eliminar registros,
 * cancelar inscripciones, rechazar solicitudes, etc.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                                isOpen,
                                                                title,
                                                                message,
                                                                confirmText = 'Confirmar',
                                                                cancelText = 'Cancelar',
                                                                confirmButtonClass = 'confirm-dialog__button--danger',
                                                                onConfirm,
                                                                onCancel,
                                                                isLoading = false
                                                            }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    const handleCancel = () => {
        if (!isLoading) {
            onCancel();
        }
    };

    // Prevenir cierre con Escape si está cargando
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                handleCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isLoading]);

    return (
        <>
            <div
                className="confirm-dialog__overlay"
                onClick={handleCancel}
                aria-hidden="true"
            />
            <div
                className="confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-message"
            >
                <div className="confirm-dialog__content">
                    <h2 id="confirm-dialog-title" className="confirm-dialog__title">
                        {title}
                    </h2>
                    <p id="confirm-dialog-message" className="confirm-dialog__message">
                        {message}
                    </p>
                    <div className="confirm-dialog__actions">
                        <button
                            className="confirm-dialog__button confirm-dialog__button--cancel"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </button>
                        <button
                            className={`confirm-dialog__button ${confirmButtonClass}`}
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="confirm-dialog__spinner" />
                                    Procesando...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};