import axios from 'axios';

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
    baseURL: '/api', // Usa el proxy configurado en Vite
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Importante para enviar cookies de sesión
});

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
    (response) => {
        // Si la respuesta es exitosa, retornarla
        return response;
    },
    (error) => {
        // Manejar errores globalmente
        if (error.response?.status === 401) {
            // Redirigir a login si no está autenticado
            window.location.href = '/login';
        }

        // Rechazar la promesa con el error
        return Promise.reject(error);
    }
);

export default axiosInstance;