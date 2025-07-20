// src/hooks/student/useStudentProfile.ts
import { useState, useEffect } from 'react';
import { studentService } from '../../services/student';
import type { StudentProfile } from '../../types/student.types';

interface ProfileFormData {
    name: string;
    major: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Hook personalizado para la gestión del perfil del estudiante.
 *
 * Beneficios:
 * - Separa la lógica de la UI
 * - Maneja todos los estados relacionados con el perfil
 * - Centraliza las validaciones
 * - Facilita el testing
 */
export const useStudentProfile = () => {
    // Estado del perfil
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados de edición
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Estados de formularios
    const [editData, setEditData] = useState<ProfileFormData>({
        name: '',
        major: ''
    });

    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Estados de validación y feedback
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [updateStatus, setUpdateStatus] = useState<string | null>(null);

    // Cargar perfil al montar
    useEffect(() => {
        fetchProfile();
    }, []);

    // Fetch del perfil
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentService.getProfile();
            setProfile(data);
            setEditData({
                name: data.name,
                major: data.major
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    // Toggle modo edición
    const toggleEdit = () => {
        if (isEditing && profile) {
            // Cancelar edición - restaurar valores originales
            setEditData({
                name: profile.name,
                major: profile.major
            });
            setFormErrors({});
        }
        setIsEditing(!isEditing);
    };

    // Actualizar datos del formulario
    const updateEditData = (field: keyof ProfileFormData, value: string) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo
        if (formErrors[field]) {
            setFormErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    // Actualizar datos de contraseña
    const updatePasswordData = (field: keyof PasswordFormData, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo
        if (formErrors[field]) {
            setFormErrors(prev => {
                const { [field]: _, ...rest } = prev;
                return rest;
            });
        }
    };

    // Validar formulario de perfil
    const validateProfileForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!editData.name.trim()) {
            errors.name = 'El nombre es requerido';
        }

        if (!editData.major.trim()) {
            errors.major = 'La carrera es requerida';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validar formulario de contraseña
    const validatePasswordForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'La contraseña actual es requerida';
        }

        if (!passwordData.newPassword) {
            errors.newPassword = 'La nueva contraseña es requerida';
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Debes confirmar la nueva contraseña';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Guardar cambios del perfil
    const saveProfile = async () => {
        if (!validateProfileForm()) {
            return false;
        }

        try {
            const updatedProfile = await studentService.updateProfile(editData);
            setProfile(updatedProfile);
            setIsEditing(false);
            setUpdateStatus('Perfil actualizado exitosamente');
            setTimeout(() => setUpdateStatus(null), 3000);
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
            setUpdateStatus(errorMessage);
            return false;
        }
    };

    // Cambiar contraseña
    const changePassword = async () => {
        if (!validatePasswordForm()) {
            return false;
        }

        try {
            await studentService.changePassword(passwordData);
            setIsChangingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setFormErrors({});
            setUpdateStatus('Contraseña cambiada exitosamente');
            setTimeout(() => setUpdateStatus(null), 3000);
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña';
            setFormErrors({ currentPassword: errorMessage });
            return false;
        }
    };

    // Cancelar cambio de contraseña
    const cancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setFormErrors({});
    };

    return {
        // Estado
        profile,
        loading,
        error,
        isEditing,
        isChangingPassword,
        editData,
        passwordData,
        formErrors,
        updateStatus,

        // Acciones
        toggleEdit,
        updateEditData,
        updatePasswordData,
        saveProfile,
        changePassword,
        setIsChangingPassword,
        cancelPasswordChange,
        refresh: fetchProfile
    };
};