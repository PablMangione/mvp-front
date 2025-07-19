// Tipos para datos de estudiantes

export interface Subject {
    id: number;
    name: string;
    major: string;
    courseYear: number;
}

export interface CourseGroup {
    id: number;
    subjectId: number;
    subjectName: string;
    teacherId: number | null;
    teacherName: string;
    status: 'PLANNED' | 'ACTIVE' | 'CLOSED';
    type: 'REGULAR' | 'INTENSIVE';
    price: number;
    maxCapacity: number;
    enrolledStudents: number;
    sessions?: GroupSession[];
}

export interface GroupSession {
    id: number;
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    startTime: string;
    endTime: string;
    classroom: string;
}

export interface SubjectWithGroups {
    subject: Subject;
    groups: CourseGroup[];
}

export interface EnrollmentSummary {
    id: number;
    groupId: number;
    subjectName: string;
    teacherName: string;
    groupType: 'REGULAR' | 'INTENSIVE';
    schedule: string;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
    enrollmentDate: string;
}

export interface StudentProfile {
    id: number;
    name: string;
    email: string;
    major: string;
    createdAt: string;
    updatedAt?: string;
}

export interface StudentProfile {
    id: number;
    name: string;
    email: string;
    major: string;
    createdAt: string;
    updatedAt?: string;
}

export interface GroupRequest {
    id: number;
    studentId: number;
    studentName: string;
    subjectId: number;
    subjectName: string;
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    comments?: string;
    adminComments?: string;
}

export interface CreateGroupRequest {
    subjectId: number;
    comments?: string;
}

export interface GroupRequestResponse {
    requestId: number;
    success: boolean;
    message: string;
    totalRequests: number;
}