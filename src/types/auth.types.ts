// Tipos para autenticación

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    major?: string; // Solo para estudiantes
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