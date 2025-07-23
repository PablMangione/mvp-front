// src/components/admin/groups/DeleteConfirmationModal.tsx
import React from 'react';
import './DeleteConfirmationModal.css';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
    isDeleting?: boolean;
    error?: string | null;
}

/**
 * Modal reutilizable para confirmar eliminaciones.
 *
 * Este componente proporciona una confirmación visual antes de realizar
 * operaciones destructivas. Características:
 *
 * - Overlay que bloquea interacciones con el resto de la página
 * - Información clara sobre lo que se va a eliminar
 * - Estados de carga durante la operación
 * - Manejo de errores
 * - Accesibilidad con manejo de teclado (ESC para cerrar)
 *
 * Diseñado para ser reutilizable en diferentes contextos del admin.
 */
export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
                                                                                    isOpen,
                                                                                    onClose,
                                                                                    onConfirm,
                                                                                    title,
                                                                                    message,
                                                                                    itemName,
                                                                                    isDeleting = false,
                                                                                    error = null
                                                                                }) => {
    // No renderizar si el modal está cerrado
    if (!isOpen) return null;

    /**
     * Maneja el clic en el overlay.
     * Solo cierra si no hay una operación en progreso.
     */
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onClose();
        }
    };

    /**
     * Maneja las teclas presionadas.
     * ESC cierra el modal si no hay operación en progreso.
     */
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isDeleting) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, isDeleting, onClose]);

    return (
        <div
            className="delete-modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
        >
            <div className="delete-modal">
                {/* Header del modal */}
                <div className="delete-modal__header">
                    <h2 id="delete-modal-title" className="delete-modal__title">
                        {title}
                    </h2>
                    <button
                        className="delete-modal__close"
                        onClick={onClose}
                        disabled={isDeleting}
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>

                {/* Contenido del modal */}
                <div className="delete-modal__content">
                    <div className="delete-modal__icon-container">
                        <span className="delete-modal__icon">⚠️</span>
                    </div>

                    <p className="delete-modal__message">{message}</p>

                    {itemName && (
                        <div className="delete-modal__item-info">
                            <strong>{itemName}</strong>
                        </div>
                    )}

                    {error && (
                        <div className="delete-modal__error">
                            <span className="delete-modal__error-icon">❌</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <p className="delete-modal__warning">
                        Esta acción no se puede deshacer.
                    </p>
                </div>

                {/* Footer con botones */}
                <div className="delete-modal__footer">
                    <button
                        className="btn btn--secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn btn--danger"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="delete-modal__spinner"></span>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};