import axiosInstance from '../api/apiClient.ts';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User
} from '../../types/auth.types.ts';

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
        const response = await axiosInstance.get<any>('/auth/me');
        // El backend devuelve ApiResponseDto con data dentro
        return response.data.data || response.data;
    },
};