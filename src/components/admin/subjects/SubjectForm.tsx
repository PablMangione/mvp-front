// src/components/admin/subjects/SubjectForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../forms/FormField';
import { subjectManagementService } from '../../../services/admin';
import type { CreateSubjectDto, UpdateSubjectDto } from '../../../types/admin.types';
import './SubjectForm.css';
import { MAJORS, COURSE_YEARS } from '../../../constants/enums';


/**
 * Componente SubjectForm - Formulario unificado para crear y editar asignaturas.
 *
 * Este componente demuestra varios patrones importantes en React:
 *
 * 1. **Formulario Dual-Purpose**: Un solo componente maneja tanto creación como edición.
 *    Esto reduce la duplicación de código y mantiene la consistencia.
 *
 * 2. **Estado Controlado**: Cada campo está vinculado al estado de React, lo que nos
 *    permite validar, transformar y controlar los datos en tiempo real.
 *
 * 3. **Validación en Capas**: Validamos en el cliente para UX inmediata y manejamos
 *    errores del servidor para reglas de negocio complejas.
 *
 * 4. **Gestión de Estados Asíncronos**: Loading, error y success states para cada
 *    operación asíncrona (cargar datos, guardar, etc.).
 *
 * El componente detecta automáticamente si está en modo creación o edición
 * basándose en la presencia de un ID en la URL.
 */
export const SubjectForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Obtiene el ID de la URL si existe
    const isEditMode = !!id; // true si estamos editando, false si estamos creando

    // ========== Estados del formulario ==========

    /**
     * Estado principal que contiene los datos del formulario.
     * Inicializamos con valores vacíos que se llenarán si estamos editando.
     */
    const [formData, setFormData] = useState<CreateSubjectDto>({
        name: '',
        major: '',
        courseYear: 1
    });

    /**
     * Estado para rastrear qué campos han sido "tocados" (el usuario interactuó con ellos).
     * Esto nos permite mostrar errores solo después de que el usuario haya intentado
     * llenar un campo, evitando mostrar un formulario lleno de errores rojos al inicio.
     */
    const [touched, setTouched] = useState<Record<string, boolean>>({
        name: false,
        major: false,
        courseYear: false
    });

    /**
     * Estado para almacenar errores de validación.
     * La clave es el nombre del campo y el valor es el mensaje de error.
     */
    const [errors, setErrors] = useState<Record<string, string>>({});

    /**
     * Estados para manejar las operaciones asíncronas.
     * Separamos los estados de carga para dar feedback más preciso.
     */
    const [loadingSubject, setLoadingSubject] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);


    // ========== Efectos ==========

    /**
     * Efecto para cargar los datos de la asignatura cuando estamos en modo edición.
     * Solo se ejecuta si tenemos un ID válido.
     *
     * Este patrón es común en formularios de edición: primero mostramos el formulario
     * vacío/cargando, luego hacemos la petición, y finalmente llenamos los campos.
     */
    useEffect(() => {
        if (isEditMode && id) {
            loadSubjectData(parseInt(id));
        }
    }, [id, isEditMode]);

    /**
     * Efecto para validar el formulario cada vez que cambian los datos.
     * Esto proporciona feedback inmediato al usuario sobre errores.
     *
     * La validación se ejecuta en cada cambio, pero los errores solo se muestran
     * si el campo ha sido "tocado" (ver el estado touched).
     */
    useEffect(() => {
        validateForm();
    }, [formData]);

    // ========== Funciones auxiliares ==========

    /**
     * Carga los datos de una asignatura existente para edición.
     * Maneja los estados de carga y error apropiadamente.
     */
    const loadSubjectData = async (subjectId: number) => {
        try {
            setLoadingSubject(true);
            setSubmitError(null);

            const subject = await subjectManagementService.getSubjectById(subjectId);

            // Actualizamos el formulario con los datos cargados
            setFormData({
                name: subject.name,
                major: subject.major,
                courseYear: subject.courseYear
            });
        } catch (error) {
            console.error('Error al cargar la asignatura:', error);
            setSubmitError('No se pudo cargar la información de la asignatura.');
        } finally {
            setLoadingSubject(false);
        }
    };

    /**
     * Valida todos los campos del formulario.
     * Retorna true si el formulario es válido, false en caso contrario.
     *
     * Esta función implementa las reglas de negocio para la validación:
     * - Nombre: requerido, mínimo 3 caracteres
     * - Carrera: requerida
     * - Año: requerido y dentro del rango válido
     */
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validación del nombre
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'El nombre no puede exceder 100 caracteres';
        }

        // Validación de la carrera
        if (!formData.major) {
            newErrors.major = 'La carrera es requerida';
        }

        // Validación del año de curso
        if (!formData.courseYear) {
            newErrors.courseYear = 'El año de curso es requerido';
        } else if (formData.courseYear < 1 || formData.courseYear > 6) {
            newErrors.courseYear = 'El año debe estar entre 1 y 6';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Maneja los cambios en los campos del formulario.
     * Esta es una función genérica que funciona para cualquier campo.
     *
     * El patrón [name]: value usa "computed property names" de JavaScript,
     * lo que nos permite actualizar dinámicamente la propiedad correcta.
     */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            // Convertimos a número si el campo es courseYear
            [name]: name === 'courseYear' ? parseInt(value) || 1 : value
        }));
    };

    /**
     * Marca un campo como "tocado" cuando el usuario sale de él.
     * Esto activa la visualización de errores para ese campo específico.
     */
    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    /**
     * Maneja el envío del formulario.
     * Coordina la validación, el envío de datos y la navegación posterior.
     *
     * Este es el corazón de la lógica del formulario. Observa cómo:
     * 1. Prevenimos el comportamiento default del formulario
     * 2. Marcamos todos los campos como tocados para mostrar errores
     * 3. Validamos antes de enviar
     * 4. Manejamos tanto creación como edición
     * 5. Proporcionamos feedback apropiado en cada caso
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Marcar todos los campos como tocados para mostrar errores
        setTouched({
            name: true,
            major: true,
            courseYear: true
        });

        // Validar antes de enviar
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setSubmitError(null);

            if (isEditMode && id) {
                // Modo edición: actualizamos la asignatura existente
                const updateData: UpdateSubjectDto = {
                    name: formData.name.trim(),
                    major: formData.major,
                    courseYear: formData.courseYear
                };

                await subjectManagementService.updateSubject(parseInt(id), updateData);
            } else {
                // Modo creación: creamos una nueva asignatura
                const createData: CreateSubjectDto = {
                    name: formData.name.trim(),
                    major: formData.major,
                    courseYear: formData.courseYear
                };

                await subjectManagementService.createSubject(createData);
            }

            // Éxito: navegamos de vuelta a la lista
            navigate('/admin/subjects', {
                // Podemos pasar estado para mostrar un mensaje de éxito
                state: {
                    message: isEditMode
                        ? 'Asignatura actualizada exitosamente'
                        : 'Asignatura creada exitosamente'
                }
            });
        } catch (error: any) {
            console.error('Error al guardar:', error);

            // Manejo inteligente de errores del servidor
            if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
            } else if (error.response?.status === 409) {
                // 409 Conflict típicamente indica duplicado
                setSubmitError('Ya existe una asignatura con ese nombre en esa carrera.');
            } else {
                setSubmitError(
                    isEditMode
                        ? 'Error al actualizar la asignatura. Por favor intente nuevamente.'
                        : 'Error al crear la asignatura. Por favor intente nuevamente.'
                );
            }
        } finally {
            setSaving(false);
        }
    };

    /**
     * Cancela la operación y vuelve a la lista.
     * Es importante dar al usuario una forma de salir sin guardar.
     */
    const handleCancel = () => {
        navigate('/admin/subjects');
    };

    // ========== Renderizado condicional para estado de carga ==========

    if (loadingSubject) {
        return (
            <div className="subject-form__loading">
                <div className="spinner"></div>
                <p>Cargando información de la asignatura...</p>
            </div>
        );
    }

    // ========== Renderizado principal del formulario ==========

    return (
        <div className="subject-form">
            <div className="subject-form__header">
                <h1 className="subject-form__title">
                    {isEditMode ? 'Editar Asignatura' : 'Nueva Asignatura'}
                </h1>
                <p className="subject-form__subtitle">
                    {isEditMode
                        ? 'Modifique los datos de la asignatura existente'
                        : 'Complete los datos para crear una nueva asignatura'
                    }
                </p>
            </div>

            {/* Mensaje de error general del formulario */}
            {submitError && (
                <div className="alert alert--error">
                    {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="subject-form__form">
                {/*
                    Campo de nombre de la asignatura.
                    Observa cómo pasamos todos los props necesarios al FormField:
                    - value y onChange para el control del estado
                    - error y touched para mostrar validación
                    - onBlur para marcar como tocado
                */}
                <FormField
                    label="Nombre de la Asignatura"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    touched={touched.name}
                    required
                    placeholder="Ej: Cálculo I"
                    helperText="Ingrese el nombre completo de la asignatura"
                />

                {/*
                    Campo de selección de carrera.
                    Usa el componente FormField en modo select.
                */}
                <FormField
                    type="select"
                    label="Carrera"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.major}
                    touched={touched.major}
                    required
                    options={[
                        { value: '', label: 'Seleccione una carrera...' },
                        ...MAJORS
                    ]}
                    helperText="Seleccione la carrera a la que pertenece esta asignatura"
                />

                {/*
                    Campo de año de curso.
                    Aunque es un número, lo manejamos como select para mejor UX.
                */}
                <FormField
                    type="select"
                    label="Año de Curso"
                    name="courseYear"
                    value={formData.courseYear.toString()}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.courseYear}
                    touched={touched.courseYear}
                    required
                    options={COURSE_YEARS}
                    helperText="Seleccione el año en que se cursa esta asignatura"
                />

                {/*
                    Botones de acción.
                    Observa que el botón de guardar se deshabilita mientras se está guardando.
                */}
                <div className="subject-form__actions">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn--secondary"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="spinner spinner--small"></span>
                                Guardando...
                            </>
                        ) : (
                            isEditMode ? 'Actualizar Asignatura' : 'Crear Asignatura'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};