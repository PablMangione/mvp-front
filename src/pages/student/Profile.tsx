import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentApi } from '../../api/student.api';
import type { StudentProfile } from '../../types/student.types';
import './Profile.css';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
            const data = await studentApi.getProfile();
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

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        // Limpiar error del campo
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateEditForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!editData.name.trim()) {
            errors.name = 'El nombre es requerido';
        }

        if (!editData.major) {
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
            errors.confirmPassword = 'Debes confirmar la contraseña';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateProfile = async () => {
        if (!validateEditForm()) return;

        try {
            setUpdateStatus('Actualizando perfil...');
            const updatedProfile = await studentApi.updateProfile(editData);
            setProfile(updatedProfile);
            setIsEditing(false);
            setUpdateStatus('Perfil actualizado exitosamente');
            setTimeout(() => setUpdateStatus(null), 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
            setUpdateStatus(errorMessage);
            setTimeout(() => setUpdateStatus(null), 5000);
        }
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        try {
            setUpdateStatus('Cambiando contraseña...');
            await studentApi.changePassword(passwordData);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsChangingPassword(false);
            setUpdateStatus('Contraseña cambiada exitosamente');
            setTimeout(() => setUpdateStatus(null), 3000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña';
            setUpdateStatus(errorMessage);
            setTimeout(() => setUpdateStatus(null), 5000);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <div className="header-content">
                    <h1>ACAInfo - Mi Perfil</h1>
                    <div className="header-actions">
                        <span className="user-name">Hola, {user?.name}</span>
                        <button onClick={handleLogout} className="logout-button">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            <nav className="profile-nav">
                <ul>
                    <li>
                        <a href="#" onClick={() => navigate('/student/dashboard')} className="nav-link">
                            Inicio
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/subjects')} className="nav-link">
                            Asignaturas
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate('/student/enrollments')} className="nav-link">
                            Mis Inscripciones
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-link active">Mi Perfil</a>
                    </li>
                </ul>
            </nav>

            <main className="profile-main">
                {updateStatus && (
                    <div className={`update-status ${updateStatus.includes('exitosamente') ? 'success' : 'error'}`}>
                        {updateStatus}
                    </div>
                )}

                {loading ? (
                    <div className="loading">Cargando perfil...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : profile && (
                    <div className="profile-content">
                        <div className="profile-card">
                            <div className="profile-header-section">
                                <h2>Información Personal</h2>
                                {!isChangingPassword && (
                                    <button
                                        className={`edit-btn ${isEditing ? 'cancel' : ''}`}
                                        onClick={handleEditToggle}
                                    >
                                        {isEditing ? 'Cancelar' : 'Editar'}
                                    </button>
                                )}
                            </div>

                            <div className="profile-info">
                                <div className="info-group">
                                    <label>Nombre completo</label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editData.name}
                                                onChange={handleEditChange}
                                                className={formErrors.name ? 'error' : ''}
                                            />
                                            {formErrors.name && (
                                                <span className="field-error">{formErrors.name}</span>
                                            )}
                                        </>
                                    ) : (
                                        <p>{profile.name}</p>
                                    )}
                                </div>

                                <div className="info-group">
                                    <label>Email institucional</label>
                                    <p>{profile.email}</p>
                                    <span className="info-note">El email no se puede cambiar</span>
                                </div>

                                <div className="info-group">
                                    <label>Carrera</label>
                                    {isEditing ? (
                                        <>
                                            <select
                                                name="major"
                                                value={editData.major}
                                                onChange={handleEditChange}
                                                className={formErrors.major ? 'error' : ''}
                                            >
                                                <option value="">Selecciona tu carrera</option>
                                                <option value="Ingeniería en Sistemas">Ingeniería en Sistemas</option>
                                                <option value="Ingeniería Civil">Ingeniería Civil</option>
                                                <option value="Administración de Empresas">Administración de Empresas</option>
                                                <option value="Psicología">Psicología</option>
                                            </select>
                                            {formErrors.major && (
                                                <span className="field-error">{formErrors.major}</span>
                                            )}
                                        </>
                                    ) : (
                                        <p>{profile.major}</p>
                                    )}
                                </div>

                                <div className="info-group">
                                    <label>Miembro desde</label>
                                    <p>{formatDate(profile.createdAt)}</p>
                                </div>

                                {profile.updatedAt && (
                                    <div className="info-group">
                                        <label>Última actualización</label>
                                        <p>{formatDate(profile.updatedAt)}</p>
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="profile-actions">
                                    <button
                                        className="save-btn"
                                        onClick={handleUpdateProfile}
                                    >
                                        Guardar Cambios
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={handleEditToggle}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="profile-card">
                            <div className="profile-header-section">
                                <h2>Seguridad</h2>
                            </div>

                            {!isChangingPassword ? (
                                <div className="security-info">
                                    <p>Mantén tu cuenta segura actualizando tu contraseña regularmente.</p>
                                    <button
                                        className="change-password-btn"
                                        onClick={() => setIsChangingPassword(true)}
                                    >
                                        Cambiar Contraseña
                                    </button>
                                </div>
                            ) : (
                                <div className="password-form">
                                    <div className="info-group">
                                        <label>Contraseña actual</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className={formErrors.currentPassword ? 'error' : ''}
                                        />
                                        {formErrors.currentPassword && (
                                            <span className="field-error">{formErrors.currentPassword}</span>
                                        )}
                                    </div>

                                    <div className="info-group">
                                        <label>Nueva contraseña</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Mínimo 8 caracteres"
                                            className={formErrors.newPassword ? 'error' : ''}
                                        />
                                        {formErrors.newPassword && (
                                            <span className="field-error">{formErrors.newPassword}</span>
                                        )}
                                    </div>

                                    <div className="info-group">
                                        <label>Confirmar nueva contraseña</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className={formErrors.confirmPassword ? 'error' : ''}
                                        />
                                        {formErrors.confirmPassword && (
                                            <span className="field-error">{formErrors.confirmPassword}</span>
                                        )}
                                    </div>

                                    <div className="profile-actions">
                                        <button
                                            className="save-btn"
                                            onClick={handleChangePassword}
                                        >
                                            Cambiar Contraseña
                                        </button>
                                        <button
                                            className="cancel-btn"
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
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};