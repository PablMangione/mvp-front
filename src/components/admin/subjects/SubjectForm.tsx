// src/components/admin/subjects/SubjectForm.tsx
import React, { useState, useEffect } from 'react';
import { FormModal } from '../common';
import type { SubjectDto, CreateSubjectDto, UpdateSubjectDto } from '../../../types/admin.types';

interface SubjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateSubjectDto | UpdateSubjectDto) => Promise<void>;
    subject?: SubjectDto | null;
    loading?: boolean;
}

const MAJORS = [
    'Ingeniería en Sistemas',
    'Ingeniería Civil',
    'Administración de Empresas',
    'Psicología',
    'Medicina',
    'Derecho',
    'Arquitectura',
    'Comunicación Social'
];

/**
 * Formulario para crear o editar asignaturas.
 * Maneja validación y estado del formulario.
 */
export const SubjectForm: React.FC<SubjectFormProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            onSubmit,
                                                            subject,
                                                            loading
                                                        }) => {
    const [formData, setFormData] = useState<CreateSubjectDto>({
        code: '',
        name: '',
        credits: 0,
        year: 1,
        major: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateSubjectDto, string>>>({});

    // Cargar datos de la asignatura si es edición
    useEffect(() => {
        if (subject) {
            setFormData({
                code: subject.code,
                name: subject.name,
                credits: subject.credits,
                year: subject.year,
                major: subject.major
            });
        } else {
            // Limpiar formulario si es creación
            setFormData({
                code: '',
                name: '',
                credits: 0,
                year: 1,
                major: ''
            });
        }
        setErrors({});
    }, [subject]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
        // Limpiar error del campo
        if (errors[name as keyof CreateSubjectDto]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreateSubjectDto, string>> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'El código es requerido';
        } else if (!/^[A-Z0-9]{3,10}$/.test(formData.code)) {
            newErrors.code = 'El código debe tener 3-10 caracteres alfanuméricos en mayúsculas';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!formData.credits || formData.credits < 1) {
            newErrors.credits = 'Los créditos deben ser mayor a 0';
        } else if (formData.credits > 10) {
            newErrors.credits = 'Los créditos no pueden ser mayor a 10';
        }

        if (!formData.year || formData.year < 1) {
            newErrors.year = 'El año debe ser mayor a 0';
        } else if (formData.year > 6) {
            newErrors.year = 'El año no puede ser mayor a 6';
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
            console.error('Error en formulario:', error);
        }
    };

    return (
        <FormModal
            isOpen={isOpen}
            title={subject ? 'Editar Asignatura' : 'Nueva Asignatura'}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            submitText={subject ? 'Actualizar' : 'Crear'}
            size="medium"
        >
            <div className="form-row">
                <div className="form-group form-group--half">
                    <label htmlFor="code">Código *</label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="MAT101"
                        disabled={loading || !!subject} // No editable en modo edición
                        style={{ textTransform: 'uppercase' }}
                        maxLength={10}
                    />
                    {errors.code && <span className="form-error">{errors.code}</span>}
                    {subject && (
                        <small className="text-muted">
                            El código no se puede modificar
                        </small>
                    )}
                </div>

                <div className="form-group form-group--half">
                    <label htmlFor="credits">Créditos *</label>
                    <input
                        type="number"
                        id="credits"
                        name="credits"
                        value={formData.credits}
                        onChange={handleChange}
                        min="1"
                        max="10"
                        disabled={loading}
                    />
                    {errors.credits && <span className="form-error">{errors.credits}</span>}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="name">Nombre de la asignatura *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Cálculo I"
                    disabled={loading}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-row">
                <div className="form-group form-group--half">
                    <label htmlFor="major">Carrera *</label>
                    <select
                        id="major"
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        disabled={loading}
                    >
                        <option value="">Seleccionar carrera...</option>
                        {MAJORS.map(major => (
                            <option key={major} value={major}>
                                {major}
                            </option>
                        ))}
                    </select>
                    {errors.major && <span className="form-error">{errors.major}</span>}
                </div>

                <div className="form-group form-group--half">
                    <label htmlFor="year">Año académico *</label>
                    <select
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        disabled={loading}
                    >
                        {[1, 2, 3, 4, 5, 6].map(year => (
                            <option key={year} value={year}>
                                {year}° año
                            </option>
                        ))}
                    </select>
                    {errors.year && <span className="form-error">{errors.year}</span>}
                </div>
            </div>

            <div className="form-info">
                <small>
                    <strong>Información:</strong><br />
                    • El código debe ser único en el sistema<br />
                    • Los créditos determinan la carga académica<br />
                    • Una vez creada, el código no puede modificarse
                </small>
            </div>
        </FormModal>
    );
};