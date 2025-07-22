// src/components/admin/common/FormModal.tsx
import React, { useEffect } from 'react';
import './FormModal.css';

interface FormModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void | Promise<void>;
    children: React.ReactNode;
    submitText?: string;
    cancelText?: string;
    loading?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

/**
 * Modal genérico para formularios en el panel de administración.
 * Maneja el layout, prevención de scroll y accesibilidad.
 */
export const FormModal: React.FC<FormModalProps> = ({
                                                        isOpen,
                                                        title,
                                                        onClose,
                                                        onSubmit,
                                                        children,
                                                        submitText = 'Guardar',
                                                        cancelText = 'Cancelar',
                                                        loading = false,
                                                        size = 'medium',
                                                        className = ''
                                                    }) => {
    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Manejar cierre con Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loading) {
            await onSubmit(e);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (!loading && e.target === e.currentTarget) {
            onClose();
        }
    };

    const modalClasses = [
        'form-modal',
        `form-modal--${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className="form-modal__backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-modal-title"
        >
            <div className={modalClasses}>
                <div className="form-modal__header">
                    <h2 id="form-modal-title" className="form-modal__title">
                        {title}
                    </h2>
                    <button
                        type="button"
                        className="form-modal__close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form-modal__form">
                    <div className="form-modal__body">
                        {children}
                    </div>

                    <div className="form-modal__footer">
                        <button
                            type="button"
                            className="form-modal__button form-modal__button--cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            className="form-modal__button form-modal__button--submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="form-modal__spinner" />
                                    Guardando...
                                </>
                            ) : (
                                submitText
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};