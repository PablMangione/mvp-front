// src/components/admin/subjects/DeleteConfirmationModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { SubjectDto } from '../../../types/admin.types';
import { subjectManagementService } from '../../../services/admin';
import './DeleteConfirmationModal.css';

/**
 * Props que recibe el modal de confirmación.
 *
 * El diseño de estas props sigue el principio de "mínima superficie de API".
 * Solo pedimos lo estrictamente necesario para que el componente funcione,
 * haciéndolo más fácil de usar y mantener.
 */
interface DeleteConfirmationModalProps {
    isOpen: boolean;                    // Controla la visibilidad del modal
    onClose: () => void;               // Callback cuando se cierra sin eliminar
    onConfirm: () => Promise<void>;    // Callback cuando se confirma la eliminación
    subject: SubjectDto | null;         // La asignatura a eliminar
    title?: string;                     // Título personalizable del modal
}

/**
 * Modal de confirmación para eliminar asignaturas.
 *
 * Este componente demuestra varios conceptos avanzados de React:
 *
 * 1. **Portals**: Renderizamos el modal fuera del árbol de componentes normal
 *    para evitar problemas de z-index y overflow.
 *
 * 2. **Gestión de Focus**: Capturamos y restauramos el focus para accesibilidad,
 *    asegurando que los usuarios de teclado tengan una buena experiencia.
 *
 * 3. **Estados Asíncronos Complejos**: Manejamos múltiples operaciones async
 *    (verificación y eliminación) con estados de carga apropiados.
 *
 * 4. **Accesibilidad ARIA**: Implementamos atributos ARIA para que los
 *    lectores de pantalla entiendan la estructura del modal.
 *
 * El modal no solo pregunta "¿estás seguro?", sino que verifica activamente
 * si la eliminación es posible, proporcionando información útil al usuario.
 */
export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
                                                                                    isOpen,
                                                                                    onClose,
                                                                                    onConfirm,
                                                                                    subject,
                                                                                    title = 'Confirmar Eliminación'
                                                                                }) => {
    // ========== Estados del componente ==========

    /**
     * Estado para rastrear si la asignatura puede ser eliminada.
     * null = no verificado aún, true = puede eliminar, false = no puede
     */
    const [canDelete, setCanDelete] = useState<boolean | null>(null);

    /**
     * Mensaje explicativo cuando no se puede eliminar.
     * Proporciona contexto sobre por qué la operación está bloqueada.
     */
    const [blockingReason, setBlockingReason] = useState<string>('');

    /**
     * Estados de carga separados para cada operación asíncrona.
     * Esto permite dar feedback más preciso al usuario.
     */
    const [checkingCanDelete, setCheckingCanDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /**
     * Estado para errores durante las operaciones.
     */
    const [error, setError] = useState<string | null>(null);

    // ========== Referencias ==========

    /**
     * Referencia al elemento que tenía el focus antes de abrir el modal.
     * Lo usaremos para restaurar el focus cuando el modal se cierre.
     * Esto es crucial para la accesibilidad con teclado.
     */
    const previousActiveElement = useRef<HTMLElement | null>(null);

    /**
     * Referencia al botón de cerrar del modal.
     * Le daremos focus automáticamente cuando el modal se abra.
     */
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    /**
     * Referencia al contenedor del modal para manejar clics fuera.
     */
    const modalRef = useRef<HTMLDivElement>(null);

    // ========== Efectos ==========

    /**
     * Efecto para verificar si la asignatura puede ser eliminada.
     * Se ejecuta cada vez que el modal se abre con una nueva asignatura.
     *
     * Este patrón de "verificar antes de actuar" es una mejor práctica
     * en UX porque previene frustraciones al usuario.
     */
    useEffect(() => {
        if (isOpen && subject) {
            checkCanDelete();
        } else {
            // Resetear estados cuando se cierra
            setCanDelete(null);
            setBlockingReason('');
            setError(null);
        }
    }, [isOpen, subject?.id]);

    /**
     * Efecto para manejar el focus cuando el modal se abre/cierra.
     * Esto es fundamental para la accesibilidad.
     *
     * Cuando se abre:
     * 1. Guardamos qué elemento tenía el focus
     * 2. Movemos el focus al modal
     *
     * Cuando se cierra:
     * 1. Restauramos el focus al elemento original
     */
    useEffect(() => {
        if (isOpen) {
            // Guardar el elemento activo actual
            previousActiveElement.current = document.activeElement as HTMLElement;

            // Dar focus al botón de cerrar después de un pequeño delay
            // El delay es necesario para que el modal termine de renderizarse
            setTimeout(() => {
                closeButtonRef.current?.focus();
            }, 100);
        } else {
            // Restaurar focus al elemento previo
            previousActiveElement.current?.focus();
        }
    }, [isOpen]);

    /**
     * Efecto para manejar la tecla Escape.
     * Permite cerrar el modal presionando Esc, mejorando la UX.
     */
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // ========== Funciones auxiliares ==========

    /**
     * Verifica si la asignatura puede ser eliminada.
     * Consulta al backend para determinar si hay restricciones.
     *
     * Esta verificación es importante porque una asignatura podría tener:
     * - Grupos de curso asociados
     * - Solicitudes de grupo pendientes
     * - Estudiantes inscritos
     */
    const checkCanDelete = async () => {
        if (!subject) return;

        try {
            setCheckingCanDelete(true);
            setError(null);

            const result = await subjectManagementService.canDeleteSubject(subject.id);
            setCanDelete(result);

            if (!result) {
                // Determinar la razón del bloqueo basándonos en la respuesta
                // En una implementación real, el backend devolvería esta información
                setBlockingReason(
                    'Esta asignatura no puede ser eliminada porque tiene grupos de curso ' +
                    'asociados o solicitudes de grupo pendientes. Debe eliminar primero ' +
                    'todos los grupos y rechazar las solicitudes pendientes.'
                );
            }
        } catch (err) {
            console.error('Error al verificar si se puede eliminar:', err);
            setError('No se pudo verificar el estado de la asignatura.');
            setCanDelete(false);
        } finally {
            setCheckingCanDelete(false);
        }
    };

    /**
     * Maneja la confirmación de eliminación.
     * Ejecuta el callback proporcionado y maneja los estados de carga.
     */
    const handleConfirm = async () => {
        if (!canDelete || deleting) return;

        try {
            setDeleting(true);
            setError(null);

            await onConfirm();

            // Si llegamos aquí, la eliminación fue exitosa
            // El componente padre debería cerrar el modal
        } catch (err: any) {
            console.error('Error al eliminar:', err);
            setError(
                err.response?.data?.message ||
                'Error al eliminar la asignatura. Por favor intente nuevamente.'
            );
        } finally {
            setDeleting(false);
        }
    };

    /**
     * Maneja clics en el overlay (fuera del modal).
     * Cierra el modal si se hace clic fuera del contenido.
     */
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !deleting) {
            onClose();
        }
    };

    /**
     * Previene que los clics dentro del modal se propaguen al overlay.
     */
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // No renderizar nada si el modal está cerrado
    if (!isOpen || !subject) return null;

    // ========== Renderizado del modal ==========

    /**
     * Usamos createPortal para renderizar el modal fuera del árbol de componentes.
     * Esto evita problemas con z-index y overflow de contenedores padres.
     *
     * El portal renderiza en document.body, asegurando que el modal
     * siempre aparezca por encima de todo el contenido.
     */
    return createPortal(
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <div
                ref={modalRef}
                className="modal"
                onClick={handleModalClick}
            >
                {/* Encabezado del modal */}
                <div className="modal__header">
                    <h2 id="modal-title" className="modal__title">
                        {title}
                    </h2>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="modal__close"
                        onClick={onClose}
                        disabled={deleting}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido del modal */}
                <div className="modal__content">
                    {/* Estado de carga mientras verificamos */}
                    {checkingCanDelete ? (
                        <div className="modal__loading">
                            <div className="spinner"></div>
                            <p>Verificando si la asignatura puede ser eliminada...</p>
                        </div>
                    ) : (
                        <>
                            {/* Mensaje principal */}
                            <p id="modal-description" className="modal__description">
                                ¿Está seguro que desea eliminar la asignatura{' '}
                                <strong>"{subject.name}"</strong> de{' '}
                                <strong>{subject.major}</strong> ({subject.courseYear}° año)?
                            </p>

                            {/* Mensaje de error si existe */}
                            {error && (
                                <div className="alert alert--error">
                                    {error}
                                </div>
                            )}

                            {/* Razón de bloqueo si no se puede eliminar */}
                            {canDelete === false && blockingReason && (
                                <div className="alert alert--warning">
                                    <span className="alert__icon">⚠️</span>
                                    <div>
                                        <p className="alert__title">
                                            No se puede eliminar esta asignatura
                                        </p>
                                        <p className="alert__message">
                                            {blockingReason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Advertencia cuando sí se puede eliminar */}
                            {canDelete === true && (
                                <div className="alert alert--warning">
                                    <span className="alert__icon">⚠️</span>
                                    <p>Esta acción no se puede deshacer.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Pie del modal con acciones */}
                <div className="modal__footer">
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={onClose}
                        disabled={deleting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn--danger"
                        onClick={handleConfirm}
                        disabled={!canDelete || deleting || checkingCanDelete}
                    >
                        {deleting ? (
                            <>
                                <span className="spinner spinner--small"></span>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar Asignatura'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body // Portal target
    );
};