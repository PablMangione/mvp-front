// src/services/student/studentService.ts
import { BaseService } from '../baseService';
import type { StudentProfile, StudentStats } from '../../types/student.types.ts';

/**
 * Servicio principal para operaciones del estudiante.
 * Maneja perfil y estadísticas generales.
 */
class StudentService extends BaseService {
    constructor() {
        super('/students');
    }

    /**
     * Obtiene el perfil del estudiante actual
     */
    async getProfile(): Promise<StudentProfile> {
        return this.get<StudentProfile>('/profile');
    }

    /**
     * Actualiza el perfil del estudiante
     */
    async updateProfile(data: { name: string; major: string }): Promise<StudentProfile> {
        return this.put<StudentProfile>('/profile/update', data);
    }

    /**
     * Cambia la contraseña del estudiante
     */
    async changePassword(data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }): Promise<void> {
        return this.post<void>('/change-password', data);
    }

    /**
     * Obtiene las estadísticas del dashboard
     */
    async getStats(): Promise<StudentStats> {
        return this.get<StudentStats>('/stats');
    }
}

// Exportar instancia única
export const studentService = new StudentService();