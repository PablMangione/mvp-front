import axiosInstance from './axios.config';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User
} from '../types/auth.types';

export const authApi = {
    // Login
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    // Registro
    register: async (data: RegisterRequest): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/auth/register', data);
        return response.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        await axiosInstance.post('/auth/logout');
    },

    // Obtener usuario actual
    getCurrentUser: async (): Promise<User> => {
        const response = await axiosInstance.get<User>('/auth/me');
        return response.data;
    },
};