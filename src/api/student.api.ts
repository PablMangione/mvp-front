import axiosInstance from './axios.config';
import type {Subject, CourseGroup, EnrollmentSummary, StudentProfile} from '../types/student.types';

export const studentApi = {
    // Obtener perfil del estudiante
    getProfile: async (): Promise<StudentProfile> => {
        const response = await axiosInstance.get<any>('/students/profile');
        // Si el backend envuelve la respuesta en ApiResponseDto
        return response.data.data || response.data;
    },

    // Obtener asignaturas de la carrera
    getMySubjects: async (): Promise<Subject[]> => {
        const response = await axiosInstance.get<any>('/students/subjects');
        console.log('Raw subjects response:', response.data); // Debug
        // El backend devuelve ApiResponseDto con data dentro
        return response.data.data || response.data;
    },

    // Obtener asignaturas por año
    getSubjectsByYear: async (year: number): Promise<Subject[]> => {
        const response = await axiosInstance.get<any>(`/students/subjects/year/${year}`);
        return response.data.data || response.data;
    },

    // Obtener grupos de una asignatura
    getSubjectGroups: async (subjectId: number): Promise<CourseGroup[]> => {
        const response = await axiosInstance.get<any>(`/subjects/${subjectId}/groups`);
        return response.data.data || response.data;
    },

    // Obtener inscripciones
    getMyEnrollments: async (): Promise<EnrollmentSummary[]> => {
        const response = await axiosInstance.get<any>('/students/enrollments');
        return response.data.data || response.data;
    },

    // Inscribirse en un grupo
    enrollInGroup: async (subjectId: number, groupId: number): Promise<any> => {
        const response = await axiosInstance.post(`/students/subjects/${subjectId}/groups/${groupId}/enroll`);
        return response.data;
    },

    // Cancelar inscripción
    cancelEnrollment: async (enrollmentId: number): Promise<any> => {
        const response = await axiosInstance.delete(`/students/enrollments/${enrollmentId}`);
        return response.data;
    },
};