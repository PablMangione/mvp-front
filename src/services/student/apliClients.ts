// src/services/api/apiClient.ts
import axios, {type AxiosInstance, AxiosError, type AxiosRequestConfig } from 'axios';

/**
 * Cliente HTTP configurado con interceptores.
 * Maneja automáticamente:
 * - Base URL
 * - Headers comunes
 * - Manejo de errores
 * - Refresh de tokens (si se implementa)
 */
class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Importante para cookies de sesión
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Aquí se pueden agregar headers adicionales si es necesario
                // Por ejemplo, un token si se usa JWT en lugar de sesiones

                // Log de requests en desarrollo
                if (import.meta.env.DEV) {
                    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                // Log de responses en desarrollo
                if (import.meta.env.DEV) {
                    console.log(`[API] Response:`, response.data);
                }

                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

                // Si es un 401 y no es el endpoint de login
                if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/login')) {
                    // Si ya intentamos retry, redirigir a login
                    if (originalRequest._retry) {
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }

                    originalRequest._retry = true;

                    // Aquí se podría implementar refresh token si se usa JWT
                    // Por ahora, redirigir a login
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Para otros errores, rechazar normalmente
                return Promise.reject(error);
            }
        );
    }

    /**
     * Realiza una petición GET
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    /**
     * Realiza una petición POST
     */
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    /**
     * Realiza una petición PUT
     */
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    /**
     * Realiza una petición DELETE
     */
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    /**
     * Realiza una petición PATCH
     */
    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    /**
     * Obtiene la instancia de axios para casos especiales
     */
    getAxiosInstance(): AxiosInstance {
        return this.client;
    }
}

// Exportar instancia única
export const apiClient = new ApiClient();

// Exportar también la instancia de axios por si se necesita
export const axiosInstance = apiClient.getAxiosInstance();