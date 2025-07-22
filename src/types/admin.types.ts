// src/types/admin.types.ts
// ========== TIPOS BASE Y COMUNES ==========

/**
 * DTO base con campos comunes para todas las entidades
 * Corresponde a BaseDto.java del backend
 */
export interface BaseDto {
    id?: number;
    createdAt?: string; // ISO 8601 datetime string
    updatedAt?: string; // ISO 8601 datetime string
}

// ========== DTOS DE GESTIÓN DE ESTUDIANTES ==========

/**
 * DTO para información de estudiante
 * Corresponde a StudentDto.java
 */
export interface StudentDto extends BaseDto {
    name: string;
    email: string;
    major: string;
}

/**
 * DTO para crear un nuevo estudiante (admin)
 * Corresponde a CreateStudentDto.java
 */
export interface CreateStudentDto {
    name: string;
    email: string;
    password: string;  // Mínimo 8 caracteres
    major: string;
}

// ========== DTOS DE GESTIÓN DE PROFESORES ==========

/**
 * DTO para información de profesor
 * Corresponde a TeacherDto.java
 */
export interface TeacherDto extends BaseDto {
    name: string;
    email: string;
}

/**
 * DTO para crear un nuevo profesor (admin)
 * Corresponde a CreateTeacherDto.java
 */
export interface CreateTeacherDto {
    name: string;
    email: string;
    password: string;  // Mínimo 8 caracteres
}

// ========== DTOS DE GESTIÓN DE ASIGNATURAS ==========

/**
 * DTO para información de asignatura
 * Corresponde a SubjectDto.java
 */
export interface SubjectDto extends BaseDto {
    name: string;
    major: string;
    courseYear: number; // 1-6
}

/**
 * DTO para crear una nueva asignatura
 * Corresponde a CreateSubjectDto.java
 */
export interface CreateSubjectDto {
    name: string;
    major: string;
    courseYear: number; // 1-6
}

/**
 * DTO para actualizar una asignatura
 * Corresponde a UpdateSubjectDto.java
 */
export interface UpdateSubjectDto {
    name?: string;
    major?: string;
    courseYear?: number;
}

// ========== DTOS DE GESTIÓN DE GRUPOS ==========

/**
 * DTO para información de grupo de curso
 * Corresponde a CourseGroupDto.java
 */
export interface CourseGroupDto extends BaseDto {
    subjectId: number;
    subjectName: string;
    teacherId?: number;
    teacherName: string;
    status: string;
    type: string;
    price: number;
    enrolledStudents: number;
    maxCapacity: number;
}

/**
 * DTO para crear un nuevo grupo
 * Corresponde a CreateCourseGroupDto.java
 */
export interface CreateCourseGroupDto {
    subjectId: number;
    teacherId?: number; // Opcional, puede asignarse después
    type: string;
    price: number;
    sessions?: CreateGroupSessionDto[];
}

/**
 * DTO para crear una sesión de grupo
 * Corresponde a CreateGroupSessionDto.java
 */
export interface CreateGroupSessionDto {
    dayOfWeek: string;
    startTime: string; // HH:mm:ss
    endTime: string;   // HH:mm:ss
    classroom: string;
}

/**
 * DTO para información de sesión de grupo
 * Corresponde a GroupSessionDto.java
 */
export interface GroupSessionDto {
    id: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    classroom: string;
}

/**
 * DTO para actualizar el estado de un grupo
 * Corresponde a UpdateGroupStatusDto.java
 */
export interface UpdateGroupStatusDto {
    status: string;
    reason?: string; // Para auditoría
}

/**
 * DTO para asignar profesor a un grupo
 * Corresponde a AssignTeacherDto.java
 */
export interface AssignTeacherDto {
    teacherId: number;
}

// ========== DTOS DE GESTIÓN DE SOLICITUDES ==========

/**
 * DTO para crear una sesión (horario) de grupo
 * Corresponde a CreateGroupSessionDto.java
 */
export interface CreateGroupSessionDto {
    dayOfWeek: string;      // 'MONDAY', 'TUESDAY', etc.
    startTime: string;      // Formato HH:mm:ss (ej: "09:00:00")
    endTime: string;        // Formato HH:mm:ss (ej: "11:00:00")
    classroom: string;     // Opcional, máximo 50 caracteres
}

/**
 * DTO para información de solicitud de grupo
 * Corresponde a GroupRequestDto.java
 */
export interface GroupRequestDto extends BaseDto {
    studentId: number;
    studentName: string;
    subjectId: number;
    subjectName: string;
    createdAt: string;
    status: string;
}

/**
 * DTO para actualizar estado de solicitud
 * Corresponde a UpdateRequestStatusDto.java
 */
export interface UpdateRequestStatusDto {
    status: string;
    adminComments?: string;
    createdGroupId?: number; // Si se aprueba y se crea un grupo
}

// ========== DTOS DE RESPUESTA COMUNES ==========

/**
 * DTO genérico para respuestas de API
 * Corresponde a ApiResponseDto.java
 */
export interface ApiResponseDto<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
}

/**
 * DTO para respuestas paginadas
 * Corresponde a PageResponseDto.java
 */
export interface PageResponseDto<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

/**
 * DTO para respuestas de eliminación
 * Corresponde a DeleteResponseDto.java
 */
export interface DeleteResponseDto {
    deletedId: number;
    entityType: string;
    success: boolean;
    message: string;
}

// ========== TIPOS DE SOLICITUD/RESPUESTA ADICIONALES ==========

/**
 * Parámetros para solicitudes paginadas
 */
export interface PageRequest {
    page?: number;
    size?: number;
    sort?: string;
}

/**
 * Respuesta de error estándar
 */
export interface ErrorResponse {
    code: string;
    message: string;
    timestamp: string;
    fieldErrors?: Record<string, string>;
}