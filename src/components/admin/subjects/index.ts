// src/components/admin/subjects/index.ts

/**
 * Punto de entrada centralizado para todos los componentes relacionados
 * con la gestión de asignaturas en el panel administrativo.
 *
 * Este patrón de exportación nos permite:
 * 1. Importaciones más limpias en otros archivos
 * 2. Fácil refactorización si cambiamos nombres de archivos
 * 3. Un lugar único para ver todos los componentes disponibles
 *
 * A medida que agreguemos más componentes (SubjectForm, SubjectDetail, etc.)
 * los exportaremos desde aquí.
 */

export { SubjectList } from './SubjectList';
export { SubjectForm } from './SubjectForm';
export { DeleteConfirmationModal } from './DeleteConfirmationModal';
export { SubjectDetail } from './SubjectDetail';
