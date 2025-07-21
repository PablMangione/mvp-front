// src/types/admin.types.ts

/**
 * Tipos para el módulo de administración
 */

// Tipos base compartidos
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// DTOs de Estudiante
export interface StudentDto {
    id: number;
    name: string;
    email: string;
    major: string;
    createdAt: string;
    active: boolean;
    enrollmentCount?: number;
}

export interface CreateStudentDto {
    name: string;
    email: string;
    password: string;
    major: string;
}

// DTOs de Profesor
export interface TeacherDto {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    active: boolean;
    groupCount?: number;
}

export interface CreateTeacherDto {
    name: string;
    email: string;
    password: string;
}

// DTOs de Asignatura
export interface SubjectDto {
    id: number;
    code: string;
    name: string;
    credits: number;
    year: number;
    major: string;
    active: boolean;
    groupCount?: number;
}

export interface CreateSubjectDto {
    code: string;
    name: string;
    credits: number;
    year: number;
    major: string;
}

export interface UpdateSubjectDto extends Partial<CreateSubjectDto> {
    active?: boolean;
}

// DTOs de Grupo
export interface CourseGroupDto {
    id: number;
    groupNumber: number;
    subject: SubjectDto;
    teacher?: TeacherDto;
    schedule: GroupSessionDto[];
    capacity: number;
    enrolled: number;
    status: 'PLANIFICADO' | 'ACTIVO' | 'CERRADO';
}

export interface GroupSessionDto {
    dayOfWeek: number; // 1-7 (Lunes-Domingo)
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
}

export interface CreateGroupDto {
    subjectId: number;
    groupNumber: number;
    teacherId?: number;
    schedule: GroupSessionDto[];
    capacity: number;
}

export interface UpdateGroupDto extends Partial<CreateGroupDto> {}

export interface UpdateGroupStatusDto {
    status: 'PLANIFICADO' | 'ACTIVO' | 'CERRADO';
    reason?: string;
}

export interface AssignTeacherDto {
    teacherId: number;
}

// DTOs de Solicitudes de Grupo
export interface GroupRequestDto {
    id: number;
    student: StudentDto;
    subject: SubjectDto;
    reason: string;
    preferredSchedule: string;
    status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
    createdAt: string;
    processedAt?: string;
    adminComment?: string;
}

export interface UpdateRequestStatusDto {
    status: 'APROBADA' | 'RECHAZADA';
    adminComment?: string;
}

// DTOs de Dashboard y Reportes
export interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalGroups: number;
    activeEnrollments: number;
    pendingRequests: number;
    recentActivity: {
        newStudents: number;
        newEnrollments: number;
        cancelledEnrollments: number;
    };
    groupOccupancy: {
        average: number;
        full: number;
        nearFull: number;
    };
}

export interface EnrollmentReport {
    period: string;
    totalEnrollments: number;
    bySubject: Record<string, number>;
    byGroup: {
        groupId: number;
        groupName: string;
        enrollments: number;
    }[];
    trends: {
        date: string;
        count: number;
    }[];
}

export interface PaymentReport {
    period: string;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
    overdueAmount: number;
    byStudent: {
        studentId: number;
        studentName: string;
        amount: number;
        status: string;
    }[];
}

export interface StudentReport {
    totalStudents: number;
    byMajor: Record<string, number>;
    byYear: Record<number, number>;
    activeStudents: number;
    inactiveStudents: number;
    averageEnrollmentsPerStudent: number;
}