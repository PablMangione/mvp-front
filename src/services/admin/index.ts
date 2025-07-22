// src/services/admin/index.ts

/**
 * Exportación centralizada de todos los servicios administrativos.
 *
 * Este archivo actúa como punto único de entrada para importar
 * todos los servicios relacionados con las funciones administrativas.
 * Facilita las importaciones en componentes y hooks al permitir
 * importar múltiples servicios desde una sola ubicación.
 *
 * Ejemplo de uso:
 * import { adminService, studentManagementService } from '@/services/admin';
 */

// Servicio para gestión de estudiantes (CRUD)
export { studentManagementService } from './studentManagementService';

// Servicio para gestión de profesores (CRUD)
export { teacherManagementService } from './teacherManagementService';

// Servicio para gestión de asignaturas (CRUD)
export { subjectManagementService } from './subjectManagementService';

// Servicio para gestión de grupos de curso
export { groupManagementService } from './groupManagementService';

// Servicio para gestión de solicitudes de grupo
export { groupRequestManagementService } from './groupRequestManagementService';

/**
 * Re-exportación de tipos relacionados con admin para conveniencia
 * Esto permite importar tipos junto con los servicios desde el mismo lugar
 */
export type {
    // Tipos de gestión de estudiantes
    StudentDto,
    CreateStudentDto,

    // Tipos de gestión de profesores
    TeacherDto,
    CreateTeacherDto,

    // Tipos de gestión de asignaturas
    SubjectDto,
    CreateSubjectDto,
    UpdateSubjectDto,

    // Tipos de gestión de grupos
    CourseGroupDto,
    CreateCourseGroupDto,
    UpdateGroupStatusDto,
    AssignTeacherDto,

    // Tipos de gestión de solicitudes
    GroupRequestDto,
    UpdateRequestStatusDto,

    // Tipos comunes de respuesta
    PageResponseDto,
    DeleteResponseDto
} from '../../types/admin.types';