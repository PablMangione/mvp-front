// src/components/admin/teachers/TeacherForm.tsx
import React, { useState, useEffect } from 'react';
import { FormModal } from '../common';
import type { TeacherDto, CreateTeacherDto } from '../../../types/admin.types';

interface TeacherFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTeacherDto) => Promise<void>;
    teacher?: TeacherDto | null;
    loading?: boolean;
}

/**
 * Formulario para crear o editar profesores.
 * Maneja validación y estado del formulario.
 */
export const TeacherForm: React.FC<TeacherFormProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            onSubmit,
                                                            teacher,
                                                            loading
                                                        }) => {
    const [formData, setFormData] = useState<CreateTeacherDto>({
        name: '',
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateTeacherDto, string>>>({});

    // Cargar datos del profesor si es edición
    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name,
                email: teacher.email,
                password: '' // No se carga la contraseña por seguridad
            });
        } else {
            // Limpiar formulario si es creación
            setFormData({
                name: '',
                email: '',
                password: ''
            });
        }
        setErrors({});
    }, [teacher]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo
        if (errors[name as keyof CreateTeacherDto]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreateTeacherDto, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        // Solo validar contraseña si es creación
        if (!teacher && !formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (!teacher && formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            // El error se maneja en el componente padre
            console.error('Error en formulario:', error);
        }
    };

    return (
        <FormModal
            isOpen={isOpen}
            title={teacher ? 'Editar Profesor' : 'Nuevo Profesor'}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            submitText={teacher ? 'Actualizar' : 'Crear'}
        >
            <div className="form-group">
                <label htmlFor="name">Nombre completo *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. Juan Pérez García"
                    disabled={loading}
                    autoFocus
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="email">Email institucional *</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="profesor@universidad.edu"
                    disabled={loading || !!teacher} // No editable en modo edición
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
                {teacher && (
                    <small className="text-muted">
                        El email no se puede modificar después de crear el usuario
                    </small>
                )}
            </div>

            {!teacher && (
                <div className="form-group">
                    <label htmlFor="password">Contraseña temporal *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 8 caracteres"
                        disabled={loading}
                    />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                    <small className="text-muted">
                        Se recomienda que el profesor cambie la contraseña en su primer acceso
                    </small>
                </div>
            )}

            <div className="form-info">
                <small>
                    <strong>Nota importante:</strong><br />
                    • Los profesores NO pueden auto-registrarse en el sistema<br />
                    • Solo un administrador puede crear cuentas de profesor<br />
                    {teacher && '• Para cambiar la contraseña, use la opción específica'}
                </small>
            </div>
        </FormModal>
    );
};