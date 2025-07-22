// src/components/admin/modals/DeleteModal.tsx
import React, { useEffect, useRef } from 'react';
import './DeleteModal.css';

/**
 * Props del componente DeleteModal.
 * Diseñado para ser flexible y adaptarse a diferentes contextos de eliminación.
 */
export interface DeleteModalProps {
    // Control de visibilidad
    isOpen: boolean;
    onClose: () => void;

    // Acción principal
    onConfirm: () => void | Promise<void>;

    // Contenido del modal
    title?: string;
    itemName?: string; // Nombre específico del item a eliminar
    message?: string; // Mensaje personalizado completo
    warningMessage?: string; // Mensaje de advertencia adicional

    // Estado de carga
    isDeleting?: boolean;

    // Personalización
    confirmButtonText?: string;
    cancelButtonText?: string;
    variant?: 'danger' | 'warning'; // Estilo visual del modal
}

/**
 * Modal de confirmación para operaciones de eliminación.
 *
 * Este componente proporciona una interfaz clara y segura para confirmar
 * operaciones destructivas. Incluye características importantes:
 *
 * - Foco automático en el botón de cancelar (para evitar eliminaciones accidentales)
 * - Cierre con tecla Escape
 * - Overlay que previene interacciones con el resto de la página
 * - Estados de carga durante la operación
 * - Mensajes personalizables según el contexto
 *
 * El diseño sigue el principio de "fricción intencional" para operaciones
 * destructivas, asegurando que el usuario esté consciente de la acción.
 *
 * @example
 * ```typescript
 * <DeleteModal
 *   isOpen={showDeleteModal}
 *   onClose={() => setShowDeleteModal(false)}
 *   onConfirm={async () => {
 *     await deleteStudent(studentId);
 *     setShowDeleteModal(false);
 *   }}
 *   itemName={selectedStudent.name}
 *   warningMessage="Esta acción no se puede deshacer."
 *   isDeleting={isDeleting}
 * />
 * ```
 */
export const DeleteModal: React.FC<DeleteModalProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            onConfirm,
                                                            title = "Confirmar Eliminación",
                                                            itemName,
                                                            message,
                                                            warningMessage = "Esta acción no se puede deshacer.",
                                                            isDeleting = false,
                                                            confirmButtonText = "Eliminar",
                                                            cancelButtonText = "Cancelar",
                                                            variant = 'danger'
                                                        }) => {
    // Referencias para manejo de foco
    const modalRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    /**
     * Genera el mensaje principal basado en los props.
     * Si no se proporciona un mensaje personalizado, genera uno por defecto.
     */
    const getMainMessage = () => {
        if (message) return message;

        if (itemName) {
            return (
                <>
                    ¿Está seguro de que desea eliminar{' '}
                    <strong className="delete-modal__item-name">{itemName}</strong>?
                </>
            );
        }

        return "¿Está seguro de que desea eliminar este elemento?";
    };

    /**
     * Maneja el evento de confirmación.
     * Soporta tanto funciones síncronas como asíncronas.
     */
    const handleConfirm = async () => {
        if (isDeleting) return;

        try {
            await onConfirm();
            // El cierre del modal debe ser manejado por el componente padre
            // después de que la operación sea exitosa
        } catch (error) {
            // Los errores deben ser manejados por el componente padre
            console.error('Error en operación de eliminación:', error);
        }
    };

    /**
     * Maneja el cierre del modal.
     * No permite cerrar mientras se está procesando una eliminación.
     */
    const handleClose = () => {
        if (!isDeleting) {
            onClose();
        }
    };

    /**
     * Efecto para manejar el foco y la accesibilidad.
     */
    useEffect(() => {
        if (isOpen) {
            // Guardar el elemento activo actual
            previousActiveElement.current = document.activeElement;

            // Enfocar el botón de cancelar después de un pequeño delay
            setTimeout(() => {
                cancelButtonRef.current?.focus();
            }, 100);

            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
        } else {
            // Restaurar el scroll del body
            document.body.style.overflow = '';

            // Restaurar el foco al elemento previo
            if (previousActiveElement.current instanceof HTMLElement) {
                previousActiveElement.current.focus();
            }
        }

        // Cleanup
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    /**
     * Efecto para manejar el cierre con tecla Escape.
     */
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !isDeleting) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isDeleting]);

    /**
     * Efecto para trap del foco dentro del modal.
     */
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            const focusableElements = modalRef.current!.querySelectorAll(
                'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
            );

            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleTabKey);

        return () => {
            document.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen]);

    // No renderizar si el modal está cerrado
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="delete-modal__overlay"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`delete-modal delete-modal--${variant}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                aria-describedby="delete-modal-description"
            >
                {/* Icono de advertencia */}
                <div className="delete-modal__icon-container">
                    <div className={`delete-modal__icon delete-modal__icon--${variant}`}>
                        {variant === 'danger' ? '🗑️' : '⚠️'}
                    </div>
                </div>

                {/* Contenido */}
                <div className="delete-modal__content">
                    <h2 id="delete-modal-title" className="delete-modal__title">
                        {title}
                    </h2>

                    <div id="delete-modal-description" className="delete-modal__description">
                        <p className="delete-modal__message">
                            {getMainMessage()}
                        </p>

                        {warningMessage && (
                            <p className="delete-modal__warning">
                                <span className="delete-modal__warning-icon">⚠️</span>
                                {warningMessage}
                            </p>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="delete-modal__actions">
                    <button
                        ref={cancelButtonRef}
                        className="delete-modal__button delete-modal__button--cancel"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        {cancelButtonText}
                    </button>

                    <button
                        className={`delete-modal__button delete-modal__button--confirm delete-modal__button--${variant}`}
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <span className="delete-modal__spinner" />
                                Eliminando...
                            </>
                        ) : (
                            confirmButtonText
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};