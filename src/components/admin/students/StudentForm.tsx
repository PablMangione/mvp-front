// src/components/admin/students/StudentForm.tsx
import React, { useState, useEffect } from 'react';
import { FormModal } from '../common';
import type { StudentDto, CreateStudentDto } from '../../../types/admin.types';

interface StudentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateStudentDto) => Promise<void>;
    student?: StudentDto | null;
    loading?: boolean;
}

/**
 * Formulario para crear o editar estudiantes.
 * Maneja validación y estado del formulario.
 */
export const StudentForm: React.FC<StudentFormProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            onSubmit,
                                                            student,
                                                            loading
                                                        }) => {
    const [formData, setFormData] = useState<CreateStudentDto>({
        name: '',
        email: '',
        password: '',
        major: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateStudentDto, string>>>({});

    // Cargar datos del estudiante si es edición
    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                email: student.email,
                password: '', // No se carga la contraseña por seguridad
                major: student.major
            });
        } else {
            // Limpiar formulario si es creación
            setFormData({
                name: '',
                email: '',
                password: '',
                major: ''
            });
        }
        setErrors({});
    }, [student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo
        if (errors[name as keyof CreateStudentDto]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreateStudentDto, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        // Solo validar contraseña si es creación
        if (!student && !formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (!student && formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (!formData.major) {
            newErrors.major = 'La carrera es requerida';
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
            title={student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            submitText={student ? 'Actualizar' : 'Crear'}
        >
            <div className="form-group">
                <label htmlFor="name">Nombre completo *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Juan Pérez García"
                    disabled={loading}
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
                    placeholder="estudiante@universidad.edu"
                    disabled={loading || !!student} // No editable en modo edición
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {!student && (
                <div className="form-group">
                    <label htmlFor="password">Contraseña *</label>
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
                </div>
            )}

            <div className="form-group">
                <label htmlFor="major">Carrera *</label>
                <select
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    disabled={loading}
                >
                    <option value="">Seleccionar carrera...</option>
                    <option value="Ingeniería en Sistemas">Ingeniería en Sistemas</option>
                    <option value="Ingeniería Civil">Ingeniería Civil</option>
                    <option value="Administración de Empresas">Administración de Empresas</option>
                    <option value="Psicología">Psicología</option>
                    <option value="Medicina">Medicina</option>
                    <option value="Derecho">Derecho</option>
                </select>
                {errors.major && <span className="form-error">{errors.major}</span>}
            </div>

            {student && (
                <div className="form-info">
                    <small>
                        * El email no se puede modificar<br />
                        * Para cambiar la contraseña, use la opción específica
                    </small>
                </div>
            )}
        </FormModal>
    );
};