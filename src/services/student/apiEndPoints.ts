// src/services/api/apiEndpoints.ts

/**
 * Constantes con todos los endpoints de la API.
 * Centraliza las URLs para facilitar cambios y mantenimiento.
 */
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password'
    },

    // Student endpoints
    STUDENT: {
        BASE: '/students',
        PROFILE: '/students/profile',
        PROFILE_UPDATE: '/students/profile/update',
        CHANGE_PASSWORD: '/students/change-password',
        STATS: '/students/stats',
        DASHBOARD_STATS: '/students/dashboard/stats',
        RECENT_ACTIVITY: '/students/recent-activity',

        // Subjects
        SUBJECTS: '/students/subjects',
        SUBJECTS_BY_YEAR: (year: number) => `/students/subjects/year/${year}`,
        SUBJECT_DETAIL: (id: number) => `/students/subjects/${id}`,
        SUBJECT_GROUPS: (id: number) => `/students/subjects/${id}/groups`,
        SUBJECTS_SEARCH: '/students/subjects/search',
        SUBJECTS_RECOMMENDED: '/students/subjects/recommended',

        // Enrollments
        ENROLLMENTS: '/students/enrollments',
        ENROLLMENT_DETAIL: (id: number) => `/students/enrollments/${id}`,
        ENROLL_IN_GROUP: (subjectId: number, groupId: number) =>
            `/students/subjects/${subjectId}/groups/${groupId}/enroll`,
        CANCEL_ENROLLMENT: (id: number) => `/students/enrollments/${id}`,
        CAN_ENROLL: (groupId: number) => `/students/groups/${groupId}/can-enroll`,

        // Group Requests
        GROUP_REQUESTS: '/students/group-requests/get',
        CREATE_GROUP_REQUEST: '/students/group-requests/create',
        CAN_REQUEST_GROUP: (subjectId: number) => `/students/group-requests/can-request/${subjectId}`,
        GROUP_REQUEST_DETAIL: (id: number) => `/students/group-requests/${id}`,
        CANCEL_GROUP_REQUEST: (id: number) => `/students/group-requests/${id}`,
        GROUP_REQUEST_STATS: '/students/group-requests/stats'
    },

    // Teacher endpoints
    TEACHER: {
        BASE: '/teachers',
        PROFILE: '/teachers/profile',
        MY_GROUPS: '/teachers/groups',
        GROUP_STUDENTS: (groupId: number) => `/teachers/groups/${groupId}/students`,
        SCHEDULE: '/teachers/schedule',
        STATS: '/teachers/stats'
    },

    // Admin endpoints
    ADMIN: {
        BASE: '/admin',

        // Students management
        STUDENTS: '/admin/students',
        STUDENT_DETAIL: (id: number) => `/admin/students/${id}`,
        CREATE_STUDENT: '/admin/students/create',
        UPDATE_STUDENT: (id: number) => `/admin/students/${id}`,
        DELETE_STUDENT: (id: number) => `/admin/students/${id}`,

        // Teachers management
        TEACHERS: '/admin/teachers',
        TEACHER_DETAIL: (id: number) => `/admin/teachers/${id}`,
        CREATE_TEACHER: '/admin/teachers/create',
        UPDATE_TEACHER: (id: number) => `/admin/teachers/${id}`,
        DELETE_TEACHER: (id: number) => `/admin/teachers/${id}`,

        // Subjects management
        SUBJECTS: '/admin/subjects',
        SUBJECT_DETAIL: (id: number) => `/admin/subjects/${id}`,
        CREATE_SUBJECT: '/admin/subjects/create',
        UPDATE_SUBJECT: (id: number) => `/admin/subjects/${id}`,
        DELETE_SUBJECT: (id: number) => `/admin/subjects/${id}`,

        // Groups management
        GROUPS: '/admin/groups',
        GROUP_DETAIL: (id: number) => `/admin/groups/${id}`,
        CREATE_GROUP: '/admin/groups/create',
        UPDATE_GROUP: (id: number) => `/admin/groups/${id}`,
        UPDATE_GROUP_STATUS: (id: number) => `/admin/groups/${id}/status`,
        ASSIGN_TEACHER: (id: number) => `/admin/groups/${id}/assign-teacher`,
        DELETE_GROUP: (id: number) => `/admin/groups/${id}`,

        // Group requests management
        GROUP_REQUESTS: '/admin/group-requests',
        GROUP_REQUEST_STATUS: (id: number) => `/admin/group-requests/${id}/status`,

        // Reports and stats
        DASHBOARD_STATS: '/admin/stats/dashboard',
        ENROLLMENT_REPORT: '/admin/reports/enrollments',
        PAYMENT_REPORT: '/admin/reports/payments',
        STUDENT_REPORT: '/admin/reports/students'
    }
};

// Tipos auxiliares para los endpoints
export type StudentEndpoints = typeof API_ENDPOINTS.STUDENT;
export type TeacherEndpoints = typeof API_ENDPOINTS.TEACHER;
export type AdminEndpoints = typeof API_ENDPOINTS.ADMIN;
export type AuthEndpoints = typeof API_ENDPOINTS.AUTH;