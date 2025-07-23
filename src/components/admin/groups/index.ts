// src/components/admin/groups/index.ts

/**
 * Punto de entrada centralizado para todos los componentes relacionados
 * con la gestión de grupos en el panel administrativo.
 *
 * Este patrón de exportación nos permite:
 * 1. Importaciones más limpias en otros archivos
 * 2. Fácil refactorización si cambiamos nombres de archivos
 * 3. Un lugar único para ver todos los componentes disponibles
 *
 * A medida que agreguemos más componentes (GroupForm, GroupDetail, etc.)
 * los exportaremos desde aquí.
 */


export { GroupList } from './GroupList';
// export { GroupForm } from './GroupForm';
export { DeleteConfirmationModal } from './DeleteConfirmationModal';
export { GroupDetail} from './GroupDetail';