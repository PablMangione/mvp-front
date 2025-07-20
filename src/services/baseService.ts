// src/services/baseService.ts
import axiosInstance from './api/apiClient.ts';
import type {AxiosResponse} from 'axios';

/**
 * Clase base para todos los servicios.
 * Proporciona métodos comunes y manejo de errores consistente.
 */
export abstract class BaseService {
    protected baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /**
     * Realiza una petición GET
     */
    protected async get<T>(endpoint: string): Promise<T> {
        const response = await axiosInstance.get<T>(`${this.baseUrl}${endpoint}`);
        return this.extractData(response);
    }

    /**
     * Realiza una petición POST
     */
    protected async post<T>(endpoint: string, data?: any): Promise<T> {
        const response = await axiosInstance.post<T>(`${this.baseUrl}${endpoint}`, data);
        return this.extractData(response);
    }

    /**
     * Realiza una petición PUT
     */
    protected async put<T>(endpoint: string, data?: any): Promise<T> {
        const response = await axiosInstance.put<T>(`${this.baseUrl}${endpoint}`, data);
        return this.extractData(response);
    }

    /**
     * Realiza una petición DELETE
     */
    protected async delete<T>(endpoint: string): Promise<T> {
        const response = await axiosInstance.delete<T>(`${this.baseUrl}${endpoint}`);
        return this.extractData(response);
    }

    /**
     * Extrae los datos de la respuesta.
     * Maneja el caso donde el backend envuelve la respuesta en ApiResponseDto
     */
    private extractData<T>(response: AxiosResponse<any>): T {
        // Si la respuesta tiene la estructura ApiResponseDto { data, success, message }
        if (response.data && 'data' in response.data && 'success' in response.data) {
            return response.data.data;
        }
        // Si no, devolver la respuesta directamente
        return response.data;
    }

    /**
     * Maneja errores de forma consistente
     */
    protected handleError(error: any): never {
        if (error.response) {
            // Error del servidor
            const message = error.response.data?.message || 'Error en el servidor';
            throw new Error(message);
        } else if (error.request) {
            // No se recibió respuesta
            throw new Error('No se pudo conectar con el servidor');
        } else {
            // Error al configurar la petición
            throw new Error('Error al realizar la petición');
        }
    }
}