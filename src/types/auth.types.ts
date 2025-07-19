// Tipos para autenticación

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    major?: string; // Solo para estudiantes
}

export interface LoginResponse {
    success: boolean;
        data: LoginUser;
    timestamp: string;  // p.ej. "2025-07-19T18:32:29"
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    major: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    major?: string;
}