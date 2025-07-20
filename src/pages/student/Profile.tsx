// src/pages/student/Profile.tsx
import React, { useState, useEffect } from 'react';
import {studentService} from '../../services/student';
import type { StudentProfile } from '../../types/student.types';
import './Profile.css';

/**
 * Página de perfil del estudiante - REFACTORIZADA
 * Removido: header, nav y logout (ahora en StudentLayout)
 */
export const Profile: React.FC = () => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Form data para edición
    const [editData, setEditData] = useState({
        name: '',
        major: ''
    });

    // Form data para cambio de contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [updateStatus, setUpdateStatus] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
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

    const handleEditToggle = () => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

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

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateProfileForm()) {
            return;
        }

        try {
            const updatedProfile = await studentService.updateProfile(editData);
            setProfile(updatedProfile);
            setIsEditing(false);
            setUpdateStatus('Perfil actualizado exitosamente');
            setTimeout(() => setUpdateStatus(null), 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
            setUpdateStatus(errorMessage);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            return;
        }

        try {
            await studentService.changePassword(passwordData);
            setIsChangingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setUpdateStatus('Contraseña cambiada exitosamente');
            setTimeout(() => setUpdateStatus(null), 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña';
            setFormErrors({ currentPassword: errorMessage });
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Cargando perfil...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-content">
                <h2>Mi Perfil</h2>

                {updateStatus && (
                    <div className={`status-message ${updateStatus.includes('Error') ? 'error' : 'success'}`}>
                        {updateStatus}
                    </div>
                )}

                {/* Información del perfil */}
                <div className="profile-section">
                    <h3>Información Personal</h3>

                    {!isEditing ? (
                        <div className="profile-info">
                            <div className="info-row">
                                <label>Nombre:</label>
                                <span>{profile?.name}</span>
                            </div>
                            <div className="info-row">
                                <label>Email:</label>
                                <span>{profile?.email}</span>
                            </div>
                            <div className="info-row">
                                <label>Carrera:</label>
                                <span>{profile?.major}</span>
                            </div>
                            <div className="info-row">
                                <label>Miembro desde:</label>
                                <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>

                            <button className="edit-button" onClick={handleEditToggle}>
                                Editar Información
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="name">Nombre</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editData.name}
                                    onChange={handleInputChange}
                                    className={formErrors.name ? 'error' : ''}
                                />
                                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={profile?.email}
                                    disabled
                                    className="disabled"
                                />
                                <small>El email no se puede cambiar</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="major">Carrera</label>
                                <input
                                    type="text"
                                    id="major"
                                    name="major"
                                    value={editData.major}
                                    onChange={handleInputChange}
                                    className={formErrors.major ? 'error' : ''}
                                />
                                {formErrors.major && <span className="error-text">{formErrors.major}</span>}
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="save-button">
                                    Guardar Cambios
                                </button>
                                <button type="button" className="cancel-button" onClick={handleEditToggle}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Cambiar contraseña */}
                <div className="profile-section">
                    <h3>Seguridad</h3>

                    {!isChangingPassword ? (
                        <button className="change-password-button" onClick={() => setIsChangingPassword(true)}>
                            Cambiar Contraseña
                        </button>
                    ) : (
                        <form onSubmit={handlePasswordUpdate} className="password-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Contraseña Actual</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className={formErrors.currentPassword ? 'error' : ''}
                                />
                                {formErrors.currentPassword && <span className="error-text">{formErrors.currentPassword}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className={formErrors.newPassword ? 'error' : ''}
                                />
                                {formErrors.newPassword && <span className="error-text">{formErrors.newPassword}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className={formErrors.confirmPassword ? 'error' : ''}
                                />
                                {formErrors.confirmPassword && <span className="error-text">{formErrors.confirmPassword}</span>}
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="save-button">
                                    Cambiar Contraseña
                                </button>
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => {
                                        setIsChangingPassword(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                        setFormErrors({});
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};