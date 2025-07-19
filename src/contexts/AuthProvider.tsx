import React, { useState, useEffect, type ReactNode } from 'react';
import { AxiosError } from 'axios';
import type { User, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { AuthContext } from './auth.context';

interface AuthProviderProps {
    children: ReactNode;
}

interface ErrorResponse {
    message: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Verificar si hay una sesión activa al cargar la app
    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            if (isMounted) {
                await checkAuthStatus();
            }
        };

        checkAuth();

        // Cleanup function para evitar actualizaciones en componentes desmontados
        return () => {
            isMounted = false;
        };
    }, []);

    const checkAuthStatus = async () => {
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
        } catch {
            // No hay sesión activa, no es un error real
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        try {
            setError(null);
            // authApi.login devuelve { success, data: LoginUser, timestamp }
            const { data: userData } = await authApi.login(credentials);

            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                major: userData.major,
            });
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.message || 'Error al iniciar sesión';
            setError(errorMessage);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            setError(null);
            const { data: userData } = await authApi.register(data);
            setUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                major: userData.major,
            });
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage = axiosError.response?.data?.message || 'Error al registrarse';
            setError(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};